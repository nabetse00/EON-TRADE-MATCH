import { useEffect, useState } from 'react';

import { Alert, Button, Form, Input, Select, Spin } from 'antd';
import { ethers } from 'ethers';
import { AssetTypes, AssetStruct } from '../models/assets';
import { ERC165Abi, ERC721InterfaceId } from '../models/erc165';
import { erc20ABI, erc721ABI, fetchBalance, fetchToken } from '@wagmi/core'
import { readContract } from '@wagmi/core'
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import RequireConnection from './RequireConnection';
import NativeAmountInput from './NativeTokenAmount';
import NftAmountInput from './NftAmountInput';
import NftNumberInput from './NftNumberInput';

type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];

export default function AssetSelectionComponent(props: { from: boolean, setAsset: (arg0: AssetStruct) => void; forbidenAsset?: AssetStruct }) {

  const [form] = Form.useForm();
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data: balance } = useBalance({ address: address, watch: true })

  const [assetAddress, setAssetAddress] = useState<{ address: `0x${string}`, status: ValidateStatus, errMsg: string }>(
    {
      address: "" as `0x${string}`,
      status: "",
      errMsg: ""
    }
  )
  const [assetType, setAssetType] = useState<AssetTypes | undefined>(AssetTypes.NATIVE_ZEN)
  const [isAssetNative, setIsAssetNative] = useState<boolean>(true)
  const [assetBal, setAssetBal] = useState<string>("")
  const [assetNativeAmount, setAssetNativeAmount] = useState<string>("")
  const [assetTokenAmount, setAssetTokenAmount] = useState<string>("")
  const [assetNftAmount, setAssetNftAmount] = useState<number>(0)
  const [assetNftTokenIds, setAssetNftTokenIds] = useState<bigint[]>()



  const onAddressChange = async (value: string) => {
    if (value as `0x${string}` == props.forbidenAsset?.assetAddress) {
      setAssetAddress({
        address: "" as `0x${string}`,
        status: "error",
        errMsg: "Forbiden address. Are you trying to set a trade from the same tokens?"
      })
      setAssetType(undefined)
      setAssetBal("")
      return
    }

    if (ethers.utils.isAddress(value)) {
      setAssetAddress({
        address: value as `0x${string}`,
        status: "",
        errMsg: ""
      })
      setAssetType(undefined)
      setAssetBal("")
    } else {
      setAssetAddress({
        address: "" as `0x${string}`,
        status: "error",
        errMsg: "Not a valid address. Remember address is case sensitive for checksum validation."
      })
      setAssetType(undefined)
      setAssetBal("")
    }
  }

  const onAssetTypeChange = (option: any) => {    
    switch (option) {
      case "Zen":
        setIsAssetNative(true)
        setAssetType(AssetTypes.NATIVE_ZEN)
        setAssetAddress({
          address: "" as `0x${string}`,
          status: "",
          errMsg: ""
        })
        form.setFieldValue("AssetAddress", "")
        setAssetNftAmount(0)
        setAssetTokenAmount("0")
        break;
      case "NotNative":
        setIsAssetNative(false)
        break;
      default:
        break;
    }
  }

  function getBalance() {
    if (address) {
      switch (assetType) {
        case AssetTypes.NATIVE_ZEN:
          fetchBalance({
            address: address,
          }).then(
            (d) => {
              setAssetBal(formatEther(d.value))
            }
          ).catch(
            (e) => {
              console.error(`error getting native balance: ${e}`)
            }
          )
          break;
        case AssetTypes.ERC20_TOKEN:
          readContract({
            address: assetAddress.address,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [address]
          }).then(
            (d) => {
              // console.log("erc20 bal fecth")
              setAssetBal(formatEther(d))
            }
          ).catch(
            (e) => {
              console.error(`error getting erc20 balance: ${e}`)
            }
          )
          break;
        case AssetTypes.ERC721_NFT:
          readContract({
            address: assetAddress.address,
            abi: erc721ABI,
            functionName: 'balanceOf',
            args: [address]
          }).then(
            (d) => {
              console.log(`erc721 bal fecth ${d}`)
              setAssetBal(d.toString())
            }
          ).catch(
            (e) => {
              console.error(`error getting erc20 balance: ${e}`)
            }
          )
          break;
        default:
          break;
      }
    }
  }

  const validateAsset = () => {

    const asset: AssetStruct = {
      assetId: 0,
      assetType: assetType!,
      assetAddress: ethers.constants.AddressZero,
      amount: "0",
      // tokekenIds: undefined
    }

    switch (assetType) {
      case AssetTypes.NATIVE_ZEN:
        asset.assetAddress = ethers.constants.AddressZero
        asset.assetType = AssetTypes.NATIVE_ZEN
        asset.amount = assetNativeAmount
        break;

      case AssetTypes.ERC20_TOKEN:
        asset.assetAddress = assetAddress.address
        asset.assetType = AssetTypes.ERC20_TOKEN
        asset.amount = assetTokenAmount
        break;

      case AssetTypes.ERC721_NFT:
        asset.assetAddress = assetAddress.address
        asset.assetType = AssetTypes.ERC721_NFT
        asset.amount = assetNftAmount.toString()
        asset.tokekenIds = assetNftTokenIds
        break;

      default:
        break;

    }
    props.setAsset(asset)
    //console.log(`asset: ${asset.assetType} - ${asset.assetAddress} \n 
    //             amount: ${asset.amount} \n 
    //             tokIds ${asset.tokekenIds?.map(v => v.toString())}`
    //)

  }

  const validateButton = () => {

    if (assetType == undefined) {
      return false
    }

    let check = false;

    switch (assetType) {
      case AssetTypes.NATIVE_ZEN:
        if (parseFloat(assetNativeAmount) > 0)
          check = true
        break;

      case AssetTypes.ERC20_TOKEN:
        if (parseFloat(assetTokenAmount) > 0)
          check = true
        break;

      case AssetTypes.ERC721_NFT:
        if (assetNftAmount > 0)
          check = true
        break;

      default:
        break;
    }

    return check

  }

  useEffect(() => {
    if (assetAddress.address != ("" as `0x${string}`) && assetAddress.status == "") {
      setAssetAddress({
        address: assetAddress.address,
        status: "validating",
        errMsg: ""
      })
      fetchToken({ address: assetAddress.address })
        .then(
          (_d) => {
            setAssetAddress({
              address: assetAddress.address,
              status: "success",
              errMsg: ""
            })
            setAssetType(AssetTypes.ERC20_TOKEN)
          }
        ).catch(
          (_e) => {
            readContract({
              address: assetAddress.address,
              abi: ERC165Abi,
              functionName: 'supportsInterface',
              args: [ERC721InterfaceId]
            })
              .then(
                (d) => {
                  if (d == true) {
                    setAssetType(AssetTypes.ERC721_NFT)
                    setAssetAddress({
                      address: assetAddress.address,
                      status: "success",
                      errMsg: ""
                    })
                  } else {
                    setAssetType(undefined)
                    setAssetAddress({
                      address: assetAddress.address,
                      status: "error",
                      errMsg: "Support Interfaces slector doesn't match ERC721 selector"
                    })
                  }
                }
              ).catch(
                (_e) => {
                  console.log(`token is not erc20 or erc721.`)
                  assetAddress.status = "error"
                  setAssetAddress({
                    address: assetAddress.address,
                    status: "error",
                    errMsg: "Not a valid ERC20 or ERC721 Contract"
                  })
                  setAssetType(undefined)
                  setAssetBal("")
                })
          }
        )
    }
  }
    , [assetAddress])

  useEffect(() => {
    if (assetType != undefined) {
      getBalance()
    }
  }
    , [assetType, address]
  )


  useEffect(() => {
    if( props.forbidenAsset?.assetType == AssetTypes.NATIVE_ZEN ){
      setIsAssetNative(false)
    }
  }, [props.forbidenAsset]
  )



  return (

    <>
      {address && !isConnecting && !isDisconnected ?
        <Form
          layout='vertical'
          name="control-ref"
          style={{ maxWidth: 600 }}
          form={form}
        >
          <Form.Item
            name="AssetType"
            label="Choose Asset type"
            initialValue={props.forbidenAsset?.assetType == AssetTypes.NATIVE_ZEN ? "NotNative" : "Zen"}
          >
            <Select
              style={{ width: 200 }}
              onChange={onAssetTypeChange}
              options={[
                { value: 'Zen', label: 'Native Zen' },
                { value: 'NotNative', label: 'Tokens or NFT' },
              ]}
              value={isAssetNative}
            />
          </Form.Item>
          {isAssetNative ?
            <Form.Item
              name="AssetNativeAmount" label="Enter Zen Amount"
              rules={[{ required: true }]}  >
              <NativeAmountInput from={props.from} amount={assetNativeAmount} balance={balance!.formatted} setAmount={setAssetNativeAmount} />
            </Form.Item>
            :
            <Form.Item name="AssetAddress" label="Enter Asset Address (must be ERC20 or ERC721)"
              validateStatus={assetAddress.status}
              help={assetAddress.errMsg}
              rules={[{ required: true }]}
              initialValue={assetAddress.address}
              hasFeedback
            >
              <Input maxLength={64}
                autoComplete={"off"}
                alt='Asset address'
                onChange={(e) => onAddressChange(e.currentTarget.value)}

              />
            </Form.Item>
          }
          {assetAddress.status == "validating" &&

            <Spin >
              <Alert
                message="Loading Contract data"
                description="Loading can be long please be patient !"
                type="warning"
              />
            </Spin>
          }
          {
            !isAssetNative && (assetType == AssetTypes.ERC20_TOKEN) &&
            <Form.Item
              name="AssetTokenAmount" label={`Enter ERC20 Amount`}
              rules={[{ required: true }]}  >
              <NativeAmountInput from={props.from} amount={assetTokenAmount} balance={assetBal} setAmount={setAssetTokenAmount} />
            </Form.Item>
          }
          {
            !isAssetNative && (assetType == AssetTypes.ERC721_NFT) && props.from &&
            <Form.Item
              name="AssetNftAmount" label={`Choose ERC721 Token Ids to trade (your own ${assetBal} nfts)`}
              rules={[{ required: true }]}  >
              <NftAmountInput
                address={address}
                nftAddress={assetAddress.address}
                amount={assetNftAmount}
                setAmount={setAssetNftAmount}
                balance={parseInt(assetBal)}
                setTokesnIdsToTrade={setAssetNftTokenIds}
              />
            </Form.Item>
          }
          {
            !isAssetNative && (assetType == AssetTypes.ERC721_NFT) && !props.from &&
            <Form.Item
              name="AssetNftAmount" label={`Choose ERC721 Token Ids to trade (your own ${assetBal} nfts)`}
              rules={[{ required: true }]}  >
              <NftNumberInput
                amount={assetNftAmount}
                setAmount={setAssetNftAmount}
                balance={parseInt(assetBal)}
              />
            </Form.Item>
          }
          <Form.Item>
            <Button type='primary' disabled={!validateButton()} onClick={validateAsset}>
              Validate Asset
            </Button>
          </Form.Item>
        </Form>
        :
        <RequireConnection />
      }
    </>
  );
};