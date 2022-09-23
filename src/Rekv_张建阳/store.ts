import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { v4 as newUuid } from 'uuid';

const StoreError = {
  STATE_KEY_NOT_VALID: new Error('[STORE]: stateKeys not valid'),
};

type StateUsage = {
  stateKeys: string[];
  rerender: Function;
};

export default class Store<State extends Record<string, any>> {
  private _state: State;
  private _stateUsageMap: Map<number, StateUsage>;

  constructor(initState: State) {
    this._state = initState;
    this._stateUsageMap = new Map();
  }

  private addUsage(
    componentId: number,
    stateKeys: string[],
    rerender: Function
  ) {
    this._stateUsageMap.set(componentId, {
      stateKeys,
      rerender,
    });
  }

  private removeUsage(componentId: number) {
    this._stateUsageMap.delete(componentId);
  }

  private rerenderComponents(needUpdateKeys: string[]): void {
    this._stateUsageMap.forEach((usage) => {
      if (_.intersection(usage.stateKeys, needUpdateKeys).length) {
        usage.rerender(Math.random());
      }
    });
  }

  useState = <T extends keyof State & string>(
    ...stateKeys: [T, ...T[]]
  ): { [k in T]: State[k] } => {
    // 校验 stateKeys 合法性
    const isKeysNotValid = stateKeys.some(
      (key) => !Object.keys(this._state).includes(key)
    );
    if (isKeysNotValid) {
      throw StoreError.STATE_KEY_NOT_VALID;
    }

    const { current: componentId } = useRef(Math.random());
    const rerender = useState(undefined)[1];
    // 在组件 mount/unmount 时，add/remove usage
    useEffect(() => {
      this.addUsage(componentId, stateKeys, rerender);
      return () => this.removeUsage(componentId);
    });
    return _.pick(this._state, stateKeys);
  };

  setState(newState: Partial<State>): void {
    const needUpdateKeys = Object.keys(newState).filter(
      (key) => !_.isEqual(newState[key], this._state[key])
    );
    Object.assign(this._state, newState);
    this.rerenderComponents(needUpdateKeys);
  }

  getState(key: string) {
    return this._state[key]
  }
}
