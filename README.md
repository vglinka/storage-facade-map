# 🔥 MapInterface for Storage facade

Just a wrapper for [Map (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
Can be used as a mock (there is an async implementation for this,
which always returns `Promise.resolve(...)` because `Map` is synchronous).
Supports iteration and default values. Written in TypeScript.
Uses the [storage-facade](https://www.npmjs.com/package/storage-facade)
library which is provides a single storage API that abstracts over
the actual storage implementation.

## Installation

```sh
npm install storage-facade@4 storage-facade-map@3
```

There are similar libraries for other storages: [indexedDB](https://www.npmjs.com/package/storage-facade-indexeddb), [localStorage](https://www.npmjs.com/package/storage-facade-localstorage), [sessionStorage](https://www.npmjs.com/package/storage-facade-sessionstorage).

# Usage

## Storage methods

- `.clear()` - removes all key-value pairs from the storage
- `.getEntries()` async only, returns an array of promises to iterate
- `.entries()` sync only, returns an array of key-value pairs
- `.deleteStorage()` - delete storage
- `.size()` - returns the number of key-value pairs
- `.key(index: number)` - returns the name of the key by its index

The `key` and `size` methods can be used to create custom iterators.

## '...Default' methods

The default values are used if the value in the storage is `undefined`.
Default values are not stored in the storage, but in the instance.
Therefore, all these methods are synchronous (no need to use the `await` keyword):

- `.addDefault(obj)` - adds keys and values from the passed object to the list of default values
- `.setDefault(obj)` - replaces the list of default values with the given object
- `.getDefault()` - returns an object containing default values
- `.clearDefault()` - replaces a list of default values with an empty object

## Examples

### Async read/write/delete

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

(async () => {
  const storage = createStorage({
    use: new MapInterface(),
    asyncMode: true, // default: false
  });

  // Write
  storage.value = { data: [40, 42] };
  // After the assignment, wait for the write operation to complete
  await storage.value; // Successfully written

  // Read value
  console.log(await storage.value); // { data: [40, 42] }

  // When writing, accesses to first-level keys are intercepted only,
  // so if you need to make changes inside the object,
  // you need to make changes and then assign it to the first level key.
  // Get object
  const updatedValue = (await storage.value) as Record<string, unknown>;
  // Make changes
  updatedValue.data = [10, 45];
  // Update storage
  storage.value = updatedValue;
  await storage.value; // Successfully written

  // Read value
  console.log(
    ((await storage.value) as Record<string, unknown>).data
  ); // [10, 45]

  // OR
  const value = (await storage.value) as Record<string, unknown>;
  console.log(value.data); // [10, 45]

  // Delete value
  delete storage.value;
  await storage.value; // Successfully deleted

  console.log(await storage.value); // undefined

  storage.value = 30;
  await storage.value;

  console.log(await storage.value); // 30

  // Clear storage
  await storage.clear();
  console.log(await storage.value); // undefined

  // Delete storage
  await storage.deleteStorage();
})();
```

### Sync read/write/delete

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

const storage = createStorage({
  use: new MapInterface(),
});

try {
  // Write
  storage.value = { data: [40, 42] };
  // Read
  console.log(storage.value); // { data: [40, 42] }

  // When writing, accesses to first-level keys are intercepted only,
  // so if you need to make changes inside the object,
  // you need to make changes and then assign it to the first level key.
  // Get object
  const updatedValue = storage.value as Record<string, unknown>;
  // Make changes
  updatedValue.data = [10, 45];
  // Update storage
  storage.value = updatedValue; // Ok
  console.log((storage.value as Record<string, unknown>).data); // [10, 45]

  delete storage.value;
  console.log(storage.value); // undefined

  storage.value = 30;
  console.log(storage.value); // 30

  storage.clear();
  console.log(storage.value); // undefined

  // Delete storage
  storage.deleteStorage();
  // An error will be thrown when trying to access
  // console.log(storage.value); // Err: 'This Storage was deleted!'
} catch (e) {
  console.error((e as Error).message);
  // If you are not using TypeScript replace this line with
  // console.error(e.message);
}
```

### Async iteration `.getEntries()`

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

(async () => {
  const storage = createStorage({
    use: new MapInterface(),
    asyncMode: true,
  });

  storage.value = 4;
  await storage.value;

  storage.other = 5;
  await storage.other;

  const promisesArray = await storage.getEntries();

  const array = promisesArray.map(async (kv) => {
    const [key, value] = await kv;
    // ... add code here ...
    return [key, value];
  });

  console.log(await Promise.all(array));
  /*
    [
      ['value', 4],
      ['other', 5],
    ]
  */
})();
```

### Sync iteration `.entries()`

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

const storage = createStorage({
  use: new MapInterface(),
});

try {
  storage.value = 4;
  storage.other = 5;

  const array = storage
    .entries()
    .map(([key, value]) => {
      // ... add code here ...
      return [key, value];
    });

  console.log(array);
  /*
    [
      ['value', 4],
      ['other', 5],
    ]
  */
} catch (e) {
  console.error((e as Error).message);
}
```

### Async '...Default' methods

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

(async () => {
  const storage = createStorage({
    use: new MapInterface(),
    asyncMode: true,
  });

  console.log(await storage.value) // undefined

  storage.addDefault({ value: 9, other: 3 });
  storage.addDefault({ value: 1, value2: 2 });

  // Since `storage.value = undefined` the default value is used
  console.log(await storage.value);  // 1

  console.log(await storage.value2); // 2
  console.log(await storage.other);  // 3

  storage.value = 42;
  await storage.value;
  // When we set a value other than `undefined`,
  // the default value is no longer used
  console.log(await storage.value); // 42

  storage.value = undefined;
  await storage.value;
  console.log(await storage.value); // 1

  storage.value = null;
  await storage.value;
  console.log(await storage.value); // null

  delete storage.value;
  await storage.value;
  console.log(await storage.value); // 1

  // getDefault
  console.log(storage.getDefault()); // { value: 1, value2: 2, other: 3 }

  // Replace 'default'
  storage.setDefault({ value: 30 });

  console.log(await storage.value); // 30
  console.log(await storage.value2); // undefined

  // clearDefault
  storage.clearDefault();

  console.log(await storage.value); // undefined
  console.log(await storage.value2); // undefined
})();
```

### Sync '...Default' methods

```TypeScript
import { createStorage } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

const storage = createStorage({
  use: new MapInterface(),
});

try {
  console.log(storage.value) // undefined

  storage.addDefault({ value: 9, other: 3 });
  storage.addDefault({ value: 1, value2: 2 });

  // Since `storage.value = undefined` the default value is used
  console.log(storage.value);  // 1

  console.log(storage.value2); // 2
  console.log(storage.other);  // 3

  storage.value = 42;
  // When we set a value other than `undefined`,
  // the default value is no longer used
  console.log(storage.value); // 42

  storage.value = undefined;
  console.log(storage.value); // 1

  storage.value = null;
  console.log(storage.value); // null

  delete storage.value;
  console.log(storage.value); // 1

  // getDefault
  console.log(storage.getDefault()); // { value: 1, value2: 2, other: 3 }

  // Replace 'default'
  storage.setDefault({ value: 30 });

  console.log(storage.value); // 30
  console.log(storage.value2); // undefined

  // clearDefault
  storage.clearDefault();

  console.log(storage.value); // undefined
  console.log(storage.value2); // undefined
} catch (e) {
  console.error((e as Error).message);
}
```

# Limitations

## Use only first level keys when writing

When writing, accesses to first-level keys (like `storage.a =`,
but not `storage.a[0] =` or `storage.a.b =`) are intercepted only,
so if you need to make changes inside the object, you need to make changes
and then assign it to the first level key.

Assigning keys of the second or more levels will not give any effect.

sync:

```TypeScript
  // Read
  console.log((storage.value as Record<string, unknown>).data); // Ok

  // Write
  // Don't do that
  storage.value.data = 42; // no effect
```

Instead, use the following approach:

```TypeScript
  // Read
  console.log((storage.value as Record<string, unknown>).data); // Ok

  // Write
  // Get object
  const updatedValue = storage.value as Record<string, unknown>;
  // Make changes
  updatedValue.data = 42;
  // Update storage
  storage.value = updatedValue; // Ок
```

async:

```TypeScript
  // Read
  console.log(
    ((await storage.value) as Record<string, unknown>).data
  ); // Ok

  // Write
  // Get object
  const updatedValue = (await storage.value) as Record<string, unknown>;
  // Make changes
  updatedValue.data = 42;
  // Update storage
  storage.value = updatedValue;
  await storage.value // Ок
```

## Don't use banned key names

There is a list of key names that cannot be used because they are the same
as built-in method names: [`clear`, `deleteStorage`, `size`, `key`,
`getEntries`, `entries`, `addDefault`, `setDefault`, `getDefault`, `clearDefault`].

Use the `keyIsNotBanned` function to check the key if needed.

```TypeScript
import { createStorage, keyIsNotBanned } from 'storage-facade';
import { MapInterface } from 'storage-facade-map';

const storage = createStorage({
  use: new MapInterface(),
});

try {
  const myNewKey = 'newKey';
  if (keyIsNotBanned(myNewKey)) {
    storage[myNewKey] = 42;
  }
} catch (e) {
  console.error((e as Error).message);
}
```

## Keys are `string`

Only values of type `string` can be used as keys.

## Values should be of any structured-cloneable type

Values should be of any [structured-cloneable type (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types).
