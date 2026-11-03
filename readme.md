# WebShop

WebShop is a small marketplace where people can browse items for sale, create an account, list something of their own, and buy from other sellers. The shop front is a React app. The API, accounts, and database are Django.

## What you can do

- Browse items that are currently for sale, and search by title
- Create an account and log in
- List an item with a title, description, and price
- Add another seller's item to your cart, remove it, and pay
- See the items you are selling and the ones you have bought
- Change your password

Product photos in the shop are mock catalog images. They are chosen from the item name so a lamp, a mug, or a pair of sneakers shows a matching picture.

## Run it locally

You need Python 3.10 or newer, Node.js, and npm.

### API

From the `backend` directory:

```bash
python -m venv venv
```

On Windows, activate it with `venv\Scripts\activate`. On macOS or Linux, use `source venv/bin/activate`.

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API and a small landing page run at http://127.0.0.1:8000/.

On that landing page, **Automatically Populate/Re-populate Database** clears non-admin users and listings, then creates six accounts and 30 items. The accounts are `testuser1` through `testuser6`, with passwords `pass1` through `pass6`. The first three accounts own the listings.

### Shop

From the `frontend` directory, in a second terminal:

```bash
npm install
npm start
```

The shop opens at http://localhost:3000/ and sends API requests to the Django server.

If `npm start` stops on an ESLint error about `jest/globals`, start it with `DISABLE_ESLINT_PLUGIN=true`. On Windows PowerShell:

```powershell
$env:DISABLE_ESLINT_PLUGIN='true'; npm start
```
