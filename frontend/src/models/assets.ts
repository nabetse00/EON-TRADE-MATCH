export const ADDRESS_ZERO = `0x0000000000000000000000000000000000000000` as `0x${string}`

export enum AssetTypes {
    NATIVE_ZEN,
    ERC20_TOKEN,
    ERC721_NFT
}

export type AssetStruct = {
    assetId: number;
    assetType: AssetTypes;
    assetAddress: `0x${string}`;
    amount: string;
    tokekenIds: bigint[];
};

export const PRICE_DECIMALS = 4 