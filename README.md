# PaperLink — Paper Material Marketplace

A 3-role B2B marketplace: **Purchasers** post enquiries, **Suppliers** respond with prices (visible only to Admin), and the **Admin** marks up prices and forwards quotes to buyers.

## Project Structure

```
paperlink/
├── .env                        ← your Supabase credentials
├── index.html
├── package.json
├── vite.config.js
├── supabase/
│   └── schema.sql              ← run this in Supabase SQL editor
└── src/
    ├── main.jsx
    ├── App.jsx                 ← routing + auth guard
    ├── context/
    │   └── AuthContext.jsx     ← session, signIn, signUp, signOut
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useEnquiries.js     ← fetch + create enquiries
    │   └── useResponses.js     ← supplier responses + admin quotes
    ├── lib/
    │   ├── supabase.js         ← supabase client singleton
    │   └── constants.js        ← paper types, colours, GSM options
    ├── components/
    │   ├── Navbar.jsx
    │   ├── StatusBadge.jsx
    │   ├── EnquiryCard.jsx
    │   ├── EnquiryForm.jsx
    │   ├── ResponseCard.jsx
    │   └── QuoteCard.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── PurchaserPage.jsx   ← post enquiries, view quotes
        ├── SupplierPage.jsx    ← browse enquiries, submit prices
        └── AdminPage.jsx       ← see everything, send marked-up quotes
```

## Setup (step by step)

### 1. Supabase project
1. Go to https://supabase.com and create a new project
2. Open **SQL Editor** and paste the entire contents of `supabase/schema.sql` → Run
3. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key

### 2. Environment variables
Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Create the Admin account
In Supabase Dashboard → **Authentication → Users → Add user**, create:
- Email: `admin@yourdomain.com`
- Password: (set a strong one)

Then in **SQL Editor** run:
```sql
insert into profiles (id, email, name, role)
select id, email, 'Admin', 'admin'
from auth.users
where email = 'admin@yourdomain.com';
```

### 4. Install & run
```bash
npm install
npm run dev
```

Open http://localhost:5173

Purchasers and Suppliers register themselves at `/register`.

## How the flow works

| Role | What they see |
|------|---------------|
| Purchaser | Their own enquiries + quotes admin sends them |
| Supplier | All open enquiries (no buyer names) · Their own responses only |
| Admin | Everything — all enquiries, all supplier prices + locations, can edit price before forwarding |

## Deploy
```bash
npm run build
# upload dist/ to Vercel, Netlify, or any static host
```
Set the same VITE_ env vars in your hosting dashboard.
