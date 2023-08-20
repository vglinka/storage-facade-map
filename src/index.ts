// Copyright (c) 2023-present Vadim Glinka
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option.

/* eslint-disable
    @typescript-eslint/no-unused-vars,
    class-methods-use-this,
*/

import {
  StorageInterface,
  type Setup,
  type StorageFacade,
  type Base,
  defaultStorageName,
} from 'storage-facade';

export class MapInterface extends StorageInterface {
  interfaceName = 'MapInterface';

  storageName = '';

  storage = new Map<string, unknown>();

  // Async
  async initAsync<T extends StorageInterface>(
    setup: Setup<T>
  ): Promise<undefined | Error> {
    this.storageName = setup.name ?? defaultStorageName;
    return Promise.resolve(undefined);
  }

  async getItemAsync(key: string): Promise<unknown> {
    return Promise.resolve(structuredClone(this.storage.get(key)));
  }

  async setItemAsync(key: string, value: unknown): Promise<undefined> {
    this.storage.set(key, structuredClone(value));
    return Promise.resolve(undefined);
  }

  async removeItemAsync(key: string): Promise<undefined> {
    this.storage.delete(key);
    return Promise.resolve(undefined);
  }

  async clearAsync(): Promise<undefined> {
    this.storage.clear();
    return Promise.resolve(undefined);
  }

  async sizeAsync(): Promise<number> {
    return Promise.resolve(this.storage.size);
  }

  async keyAsync(index: number): Promise<string> {
    return Promise.resolve(Array.from(this.storage)[index][0]);
  }

  // Sync
  initSync<T extends StorageInterface>(setup: Setup<T>): Error | undefined {
    this.storageName = setup.name ?? defaultStorageName;
    return undefined;
  }

  getItemSync(key: string): unknown {
    return structuredClone(this.storage.get(key));
  }

  setItemSync(key: string, value: unknown): void {
    this.storage.set(key, structuredClone(value));
  }

  removeItemSync(key: string): void {
    this.storage.delete(key);
  }

  clearSync(): void {
    this.storage.clear();
  }

  sizeSync(): number {
    return this.storage.size;
  }

  keySync(index: number): string {
    return Array.from(this.storage)[index][0];
  }
}

// For tests
export const getMapStorage = (storage: StorageFacade): Map<string, unknown> => {
  const base = Object.getPrototypeOf(
    Object.getPrototypeOf(storage)
  ) as Base<MapInterface>;
  return base.storageInterface.storage;
};