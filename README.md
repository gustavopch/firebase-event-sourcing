# Firebase Event Sourcing

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/gustavopch/firebase-event-sourcing-alt/CI?style=flat-square)

> Event Sourcing + CQRS + DDD for Firebase.

## Basic concepts

**Event Sourcing**: Think of a bank account. You can't simply store the current balance. Instead, you must store the records (or the **events**) that have led up to the current balance (or the **state**). The events (`deposited 100 dollars`, `withdrawn 50 dollars`, etc.) are the source of truth. The state (the current balance) is just derived from the events.

**CQRS**: It means Command Query Responsibility Segregation. All those words... it must be a pretty hard concept, doesn't it? Nah, it just means that the part of your system that's responsible for writing data will be separated from the part that's in charge of reading data. So when you write data, you'll be writing events, but when you need to read data, you'll read projections (the data derived from the events). For example, whenever you call the `deposit({ to: 'john', amount: 100 })` command, a `deposited 100 dollars to John's account` event will be recorded. In the background, that will trigger a function (a projection handler) that will update the `balance` of John's account in the `accounts` collection. Did you see it? You wrote to the `events` collection, but you'll read from the `accounts` collection.

**DDD**: It means Domain-Driven Design. It's a hard way to say you'll mostly name things in your code exactly how other non-tech people name them. Don't worry, you'll see that in action.

## Installation

```sh
npm i firebase-event-sourcing
```

```sh
yarn add firebase-event-sourcing
```

## Usage

WIP.

## License

Released under the [MIT License](./LICENSE.md).
