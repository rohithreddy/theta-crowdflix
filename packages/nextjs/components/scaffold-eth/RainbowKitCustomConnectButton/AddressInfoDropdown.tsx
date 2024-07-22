import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Button } from "~~/@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/@/components/ui/dropdown-menu";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <div className="relative">
      {" "}
      {/* Add relative positioning to the container */}
      <DropdownMenu>
        <div className="">
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="pl-0 pr-2 shadow-md !h-auto flex flex-row">
              <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
              <span className="ml-2 mr-1">
                {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
              </span>
              <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-9999">
            {" "}
            {/* Add z-50 for higher stacking order */}
            <NetworkOptions hidden={!selectingNetwork} />
            <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
              {addressCopied ? (
                <div className="flex gap-3 py-3">
                  <CheckCircleIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap">Copy address</span>
                </div>
              ) : (
                <CopyToClipboard
                  text={checkSumAddress}
                  onCopy={() => {
                    setAddressCopied(true);
                    setTimeout(() => {
                      setAddressCopied(false);
                    }, 800);
                  }}
                >
                  <div className="flex gap-3 py-3">
                    <DocumentDuplicateIcon
                      className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">Copy address</span>
                  </div>
                </CopyToClipboard>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
              <Dialog>
                <DialogTrigger asChild>
                  <label htmlFor="qrcode-modal" className="flex gap-3 py-3">
                    <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    <span className="whitespace-nowrap">View QR Code</span>
                  </label>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                    <DialogDescription>Scan this QR code to add the address to your wallet.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => {
                        document.getElementById("qrcode-modal")?.click();
                      }}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
            <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
              <Button variant="ghost" className="flex gap-3 py-3">
                <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <a
                  target="_blank"
                  href={blockExplorerAddressLink}
                  rel="noopener noreferrer"
                  className="whitespace-nowrap"
                >
                  View on Block Explorer
                </a>
              </Button>
            </DropdownMenuItem>
            {allowedNetworks.length > 1 ? (
              <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
                <Button
                  variant="ghost"
                  className="flex gap-3 py-3"
                  onClick={() => {
                    setSelectingNetwork(true);
                  }}
                >
                  <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
                </Button>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
              <Button variant="ghost" className="flex gap-3 py-3" onClick={() => disconnect()}>
                <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
};
