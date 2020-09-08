/**
 *
 * BorrowInterestRate
 *
 */
import React from 'react';
import { Tooltip } from '@blueprintjs/core';
import { Asset } from 'types/asset';
import { useBorrowInterestRate } from 'app/hooks/trading/useBorrowInterestRate';
import { LoadableValue } from '../LoadableValue';
import { weiToFixed } from 'utils/blockchain/math-helpers';
import tooltipData from 'utils/data/tooltip-text.json';

interface Props {
  asset: Asset;
  weiAmount: string;
}

export function BorrowInterestRate(props: Props) {
  const { value, loading } = useBorrowInterestRate(
    props.asset,
    props.weiAmount,
  );

  return (
    <div className="mb-2">
      <div className="d-inline text-lightGrey">
        <Tooltip content={<>{tooltipData.trading.InterestAPR}</>}>
          Interest APR
        </Tooltip>
      </div>
      <div className="d-inline float-right">
        <LoadableValue
          value={
            <Tooltip content={<>{weiToFixed(value, 18)}%</>}>
              <>
                {weiToFixed(value, 2)} <span className="text-lightGrey">%</span>
              </>
            </Tooltip>
          }
          loading={loading}
        />
      </div>
    </div>
  );
}
