# Material Handling Web

## Note

This project is configured to use Bun as the runtime. If you want to run in NodeJS you have to change script in package.json

If you dont have bun you can install with command below

Windows:
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

Linux or MacOS:
```bash
curl -fsSL https://bun.sh/install | bash
```

## Setup & Running the Project

Before running the project, follow these steps:

1. Install the project dependencies:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```

## Features
This application have 2 main features:
1. **Material Request**
2. **Material Request Detail**

## Pages 
This application also have 3 pages:
1. **Root (/)**, that show material request data in table.
2. **Create Material Request (/material-request/create)**, Form request to **create** material request and the detail.
3. **View Material Request (/material-request/:id)**, to show material request data and material request detail in table. And in this can you also can edit material request data and edit or remove material request detail that show a dialog.