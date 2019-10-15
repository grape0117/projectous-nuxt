# projectous-draggable-ts

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run format
```

### API Docs

Implemented next API methods

```
fetch: fetch list of entities
get: get entity by id
post: create a new entity
put: update an existing entity
delete: delete an entity by id
```

Developer can connect to external API with next commands

```
in vue component: this.$http().fetch('users')
in vuex: this._vm.$http().fetch('users')
```

Base API url could be changed in /http/BaseHttp.ts class
