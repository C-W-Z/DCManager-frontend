# DCManager-frontend

## How to run

### Run Local

to run locally (without docker), you need to install the dependency first

```
cd DCManager-frontend/
npm install
```

then

```
npm run dev
```

### Use Mock Data

set `.env` to

```
API_MODE=mock
```

## Convention

`lib/`: 定義型別、API、幫手函式  
`pages/`: 頁面  
`components/`: 可重複利用的 React Components  
`components/ui/`: Shadcn 元件  
`context/`: use context
