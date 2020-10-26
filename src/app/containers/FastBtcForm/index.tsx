/**
 *
 * FastBtcForm
 *
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import { Icon, Spinner } from '@blueprintjs/core';

import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { translations } from 'locales/i18n';

import { reducer, sliceKey, actions } from './slice';
import { selectFastBtcForm } from './selectors';
import { fastBtcFormSaga } from './saga';
import { FieldGroup } from '../../components/FieldGroup';
import { InputField } from '../../components/InputField';
import { useAccount } from '../../hooks/useAccount';
import { DummyField } from '../../components/DummyField';
import { SkeletonRow } from '../../components/Skeleton/SkeletonRow';
import { weiTo4, weiToFixed } from '../../../utils/blockchain/math-helpers';
import { LinkToExplorer } from '../../components/LinkToExplorer';
import { TradeButton } from '../../components/TradeButton';

const s = translations.fastBtcForm;

interface Props {}

export function FastBtcForm(props: Props) {
  useInjectReducer({ key: sliceKey, reducer: reducer });
  useInjectSaga({ key: sliceKey, saga: fastBtcFormSaga });

  const state = useSelector(selectFastBtcForm);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, i18n } = useTranslation();

  const address = useAccount();

  useEffect(() => {
    dispatch(actions.changeReceiverAddress(address));
  }, [address, dispatch]);

  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-6 mt-5 mt-lg-0 pr-lg-5">
          <div className="sovryn-border p-3">
            <FieldGroup label={'Your RSK Wallet'}>
              <InputField
                invalid={!state.isReceiverAddressValid}
                value={state.receiverAddress}
                onChange={e =>
                  dispatch(actions.changeReceiverAddress(e.currentTarget.value))
                }
                rightElement={
                  state.isReceiverAddressValidating && (
                    <>
                      <Spinner size={18} />
                    </>
                  )
                }
              />
            </FieldGroup>

            {state.depositError && (
              <div className="alert alert-warning">{state.depositError}</div>
            )}

            {state.depositAddress && (
              <>
                <FieldGroup label={'BTC Deposit Address'}>
                  <DummyField>{state.depositAddress}</DummyField>
                </FieldGroup>
                <div className="d-flex justify-content-between mb-4">
                  <span>min: {state.minDepositAmount} BTC</span>
                  <span>max: {state.maxDepositAmount} BTC</span>
                </div>
                {!state.depositTx && (
                  <>
                    <div className="text-center">
                      <QRCode
                        value={state.depositAddress}
                        renderAs="svg"
                        bgColor="var(--primary)"
                        fgColor="var(--white)"
                        size={258}
                      />
                    </div>
                    <div className="d-flex flex-row justify-content-center mt-3">
                      <span>Waiting for deposit</span>
                      <Spinner size={22} className="ml-3" />
                    </div>
                  </>
                )}
              </>
            )}
            {state.depositTx && (
              <div className="mt-3">
                <p>
                  <Icon icon="tick" className="mr-2" />
                  Deposited {weiTo4(state.depositTx.value)}{' '}
                  <span className="text-muted">BTC</span> to deposit wallet.
                </p>
                <LinkToExplorer
                  txHash={state.depositTx.txHash}
                  realBtc={true}
                />
                {!state.transferTx && (
                  <div className="d-flex flex-row justify-content-start mt-3">
                    <span>We are exchanging to rBTC it now.</span>
                    <Spinner size={22} className="ml-3" />
                  </div>
                )}
              </div>
            )}
            {state.transferTx && (
              <>
                <div className="mt-3">
                  <p>
                    <Icon icon="tick" className="mr-2" />
                    {weiTo4(state.transferTx.value)}{' '}
                    <span className="text-muted">rBTC</span> was transfered to
                    your RSK walllet
                  </p>
                  <LinkToExplorer txHash={state.transferTx.txHash} />
                </div>
                <div className="mt-3 d-flex flex-row justify-content-end">
                  <TradeButton
                    text="Swap again"
                    onClick={() => dispatch(actions.reset())}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="col-12 col-lg-6 pl-lg-5 mt-5 mt-lg-0">
          <div className="sovryn-border p-3">
            {!state.history.length && !state.isHistoryLoading && (
              <p>{t(s.history.empty)}</p>
            )}
            {state.isHistoryLoading && !state.history.length && <SkeletonRow />}
            {state.history.map(item => (
              <div
                className="d-flex flex-row justify-content-between w-100"
                key={item.txHash}
              >
                <div className="d-flex flex-row align-items-center mr-3">
                  <div className="mr-3">
                    <Icon
                      icon={
                        item.type === 'deposit'
                          ? 'chevron-right'
                          : 'chevron-left'
                      }
                    />
                  </div>
                  <LinkToExplorer
                    txHash={item.txHash}
                    realBtc={item.type === 'deposit'}
                  />
                </div>
                <div>
                  {weiToFixed(item.valueBtc * 1e10, 4)}{' '}
                  <span className="text-muted">
                    {item.type === 'deposit' ? 'BTC' : 'rBTC'}
                  </span>{' '}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}