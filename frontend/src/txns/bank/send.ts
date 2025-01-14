import { parseBalance } from '@/utils/denom';
import { formatNumber } from '@/utils/util';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
export const msgSendTypeUrl: string = '/cosmos.bank.v1beta1.MsgSend';

export function SendMsg(
  from: string,
  to: string,
  amount: number,
  denom: string
): Msg {
  return {
    typeUrl: msgSendTypeUrl,
    value: MsgSend.fromPartial({
      fromAddress: from,
      toAddress: to,
      amount: [
        {
          denom: denom,
          amount: String(amount),
        },
      ],
    }),
  };
}

export function serialize(msg: Msg): string {
  const { toAddress, amount } = msg.value;
  return `Sent ${amount[0].amount} ${amount[0].denom} to ${toAddress}`;
}

export function formattedSerialize(
  msg: Msg,
  decimals: number,
  originalDenom: string
) {
  const { toAddress, amount } = msg.value;
  const parsedAmount = parseBalance(amount, decimals, amount[0].denom);
  return `Send ${formatNumber(parsedAmount)} ${originalDenom} to ${toAddress}`;
}
