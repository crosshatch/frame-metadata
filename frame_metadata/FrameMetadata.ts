import * as $ from "../deps/subshape.ts"

export interface FrameMetadata {
  types: Record<string, $.AnyShape>
  paths: Record<string, $.AnyShape>
  pallets: Record<string, FrameMetadata.Pallet>
  extrinsic: FrameMetadata.Extrinsic
}
export namespace FrameMetadata {
  export interface Pallet {
    id: number
    name: string
    storagePrefix: string
    storage: Record<string, StorageEntries>
    constants: Record<string, Constant>
    types: {
      call?: $.AnyShape
      event?: $.AnyShape
      error?: $.AnyShape
    }
    docs: string
  }

  export interface StorageEntries {
    singular: boolean
    name: string
    key: $.AnyShape
    partialKey: $.AnyShape
    value: $.AnyShape
    default?: Uint8Array
    docs: string
  }

  export interface Constant {
    name: string
    shape: $.AnyShape
    value: Uint8Array
    docs: string
  }

  export interface Extrinsic {
    call: $.AnyShape
    signature: $.AnyShape
    address: $.AnyShape
    extra: $.AnyShape
    additional: $.AnyShape
  }
}
