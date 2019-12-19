/* eslint-disable no-nested-ternary */
import React from "react";
import MoreList from "@components/more_list";
import { PoolItem } from "@components/pool_item";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { wsSend } from "@utils/websocket";
import store, { createAction } from "@reducers/store";
import { operationType } from "@reducers/accountReducer";
import { Ipool, Idelegation } from "@interfaces/types";
import { performance_low, performance_high } from "@utils/constants.json";

const mapToState = ({ account }) => {
    console.log("selector trigger");
    return {
        pools: { ...account.pools },
        operation: { ...account.operation },
        delegations: { ...account.delegations }
    };
};

let scrollTop = 0;
const poolList = props => {
    const { history } = props;
    const {
        pools,
        operation,
        delegations
    }: {
        pools: { [address: string]: Ipool };
        delegations: { [poolAddres: string]: Idelegation };
        operation: {
            pool: string;
            type: operationType;
        };
    } = useSelector(mapToState, shallowEqual);
    const dispatch = useDispatch();

    const onRefresh = () => {
        wsSend({ method: "pools", params: [false] });
    };

    const onReachEnd = () => {
        wsSend({ method: "pools", params: [false] });
    };

    const toPool = pool => {
        dispatch(
            createAction("account/update")({
                operation: {
                    ...operation,
                    pool
                }
            })
        );
        if (operationType.default === operation.type) {
            history.push("/operation");
        } else if (operationType.delegate === operation.type) {
            history.push("/delegate");
        } else if (operationType.undelegate === operation.type) {
            history.push("/undelegate");
        } else if (operationType.withdraw === operation.type) {
            history.push("/withdraw");
        }
    };

    React.useEffect(() => {
        if (Object.keys(pools).length === 0) {
            wsSend({ method: "pools", params: [false] });
        }
    }, []);

    React.useEffect(() => {
        const element =
            document.getElementById("pullLoadContainer") || document.body;
        const handleScollTop = e => {
            scrollTop = e.target.scrollTop;
        };
        element.addEventListener("scroll", handleScollTop);
        if (scrollTop && navigator.userAgent.match("Android")) {
            element.scrollTop = scrollTop;
        }
        return () => {
            element.removeEventListener("scroll", handleScollTop);
        };
    });

    const [can_undelegate, can_withdraw] = Object.keys(delegations).reduce(
        ([arr1, arr2], el) => {
            const { stake, rewards } = delegations[el];
            if (stake.gt(0)) {
                arr1.push(el);
            }
            if (rewards.gt(0)) {
                arr2.push(el);
            }
            return [arr1, arr2];
        },
        [[], []]
    );

    let filters = [];
    switch (operation.type) {
        case operationType.undelegate:
            filters = can_undelegate;
            break;
        case operationType.withdraw:
            filters = can_withdraw;
            break;
        default:
            filters = Object.keys(pools);
    }
    const sorter = (a: Ipool, b: Ipool) => {
        const getLevel = (pool: Ipool) => {
            const performanceNumber = pool.performance.times(100).toNumber();
            return performanceNumber > performance_high
                ? 3
                : performanceNumber < performance_low
                ? 1
                : 2;
        };
        return getLevel(b) - getLevel(a);
    };
    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={Object.values(pools)
                .filter(el => filters.includes(el.address))
                .sort(sorter)}
            renderItem={pool => {
                return <PoolItem pool={pool} toPool={toPool} />;
            }}
        />
    );
};
poolList.canGoBack = () => {
    const { address } = store.getState().account;
    return address !== "";
};
export default poolList;
