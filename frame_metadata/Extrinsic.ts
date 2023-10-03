import * as $ from "../deps/subshape.ts"
import { blake2_256 } from "../hashers.ts"
import { FrameMetadata } from "./FrameMetadata.ts"

export interface Extrinsic<M extends FrameMetadata> {
  protocolVersion: number
  signature?:
    | {
      sender: { address: $.Output<M["extrinsic"]["address"]>; sign: Signer<M> }
      extra: $.Output<M["extrinsic"]["extra"]>
      additional: $.Output<M["extrinsic"]["additional"]>
      sig?: never
    }
    | {
      sender: { address: $.Output<M["extrinsic"]["address"]>; sign?: Signer<M> }
      extra: $.Output<M["extrinsic"]["extra"]>
      additional?: never
      sig: $.Output<M["extrinsic"]["signature"]>
    }
  call: $.Output<M["extrinsic"]["call"]>
}

export type Signer<M extends FrameMetadata> = (
  message: Uint8Array,
  fullData: Uint8Array,
) => $.Output<M["extrinsic"]["signature"]> | Promise<$.Output<M["extrinsic"]["signature"]>>

export function $extrinsic<M extends FrameMetadata>(metadata: M): $.Shape<Extrinsic<M>> {
  const $sig = metadata.extrinsic.signature as $.Shape<$.Output<M["extrinsic"]["signature"]>>
  const $sigPromise = $.promise($sig)
  const $call = metadata.extrinsic.call as $.Shape<$.Output<M["extrinsic"]["call"]>>
  const $address = metadata.extrinsic.address as $.Shape<$.Output<M["extrinsic"]["address"]>>
  const $extra = metadata.extrinsic.extra as $.Shape<$.Output<M["extrinsic"]["extra"]>>
  const $additional = metadata.extrinsic.additional as $.Shape<
    $.Output<M["extrinsic"]["additional"]>
  >

  const toSignSize = $call.staticSize + $extra.staticSize + $additional.staticSize
  const totalSize = 1 + $address.staticSize + $sig.staticSize + toSignSize

  const $baseExtrinsic: $.Shape<Extrinsic<M>> = $.createShape({
    metadata: [],
    staticSize: totalSize,
    subEncode(buffer, extrinsic) {
      const firstByte = (+!!extrinsic.signature << 7) | extrinsic.protocolVersion
      buffer.array[buffer.index++] = firstByte
      const { signature, call } = extrinsic
      if (signature) {
        $address.subEncode(buffer, signature.sender.address)
        if (signature.additional) {
          const toSignBuffer = new $.EncodeBuffer(buffer.stealAlloc(toSignSize))
          $call.subEncode(toSignBuffer, call)
          const callEnd = toSignBuffer.finishedSize + toSignBuffer.index
          $extra.subEncode(toSignBuffer, signature.extra)
          const extraEnd = toSignBuffer.finishedSize + toSignBuffer.index
          $additional.subEncode(toSignBuffer, signature.additional)
          const toSignEncoded = toSignBuffer.finish()
          const callEncoded = toSignEncoded.subarray(0, callEnd)
          const extraEncoded = toSignEncoded.subarray(callEnd, extraEnd)
          const toSign = toSignEncoded.length > 256
            ? blake2_256.hash(toSignEncoded)
            : toSignEncoded
          const sig = signature.sender.sign!(toSign, toSignEncoded)
          if (sig instanceof Promise) {
            $sigPromise.subEncode(buffer, sig)
          } else {
            $sig.subEncode(buffer, sig)
          }
          buffer.insertArray(extraEncoded)
          buffer.insertArray(callEncoded)
        } else {
          $sig.subEncode(buffer, signature.sig!)
          $extra.subEncode(buffer, signature.extra)
          $call.subEncode(buffer, call)
        }
      } else {
        $call.subEncode(buffer, call)
      }
    },
    subDecode(buffer) {
      const firstByte = buffer.array[buffer.index++]!
      const hasSignature = firstByte & (1 << 7)
      const protocolVersion = firstByte & ~(1 << 7)
      let signature: Extrinsic<M>["signature"]
      if (hasSignature) {
        const address = $address.subDecode(buffer)
        const sig = $sig.subDecode(buffer)
        const extra = $extra.subDecode(buffer)
        signature = { sender: { address }, sig, extra }
      }
      const call = $call.subDecode(buffer)
      return { protocolVersion, signature, call }
    },
    subAssert(assert) {
      assert.typeof(this, "object")
      assert.key(this, "protocolVersion").equals($.u8, 4)
      const value_ = assert.value as any
      $call.subAssert(assert.key(this, "call"))
      if (value_.signature) {
        const signatureAssertState = assert.key(this, "signature")
        $address.subAssert(signatureAssertState.key(this, "sender").key(this, "address"))
        $extra.subAssert(signatureAssertState.key(this, "extra"))
        if ("additional" in value_.signature) {
          $additional.subAssert(signatureAssertState.key(this, "additional"))
          signatureAssertState.key(this, "sender").key(this, "sign").typeof(this, "function")
        } else {
          $sig.subAssert(signatureAssertState.key(this, "sig"))
        }
      }
    },
  })

  return $.withMetadata(
    $.metadata("$extrinsic", $extrinsic, metadata),
    $.lenPrefixed($baseExtrinsic),
  )
}

export class SignerError extends Error {
  override readonly name = "SignerError"

  constructor(readonly inner: unknown) {
    super()
  }
}
