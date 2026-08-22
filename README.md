# 🛒 Mini D-Mart — Full-Stack Grocery Store Web Application

![Mini D-Mart Banner](https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80)

A full-fledged, production-ready **Mini D-Mart Grocery Store Application** built for the Round 2 Full-Stack Developer Practical Assessment.

- 🌐 **Live Hosted Application**: [https://mini-dmart-grocery-app.vercel.app](https://mini-dmart-grocery-app.vercel.app)
- 📁 **GitHub Repository**: [https://github.com/Omkarfulari75/mini-dmart-grocery-app](https://github.com/Omkarfulari75/mini-dmart-grocery-app)
- ⚡ **Vercel Dashboard**: [https://vercel.com/omkarfulari699-7052s-projects](https://vercel.com/omkarfulari699-7052s-projects)

---

## 🌟 Key Features & Capabilities

### 🛒 Customer Experience
- **Interactive Grocery Catalog**: Search by name/category, filter by stock status, and sort by price or popularity rating.
- **Product Detail Drawer**: Full product specs, unit size (1 kg, 500g, 1L), return policy days, and real-time inventory count.
- **Cart & Order Scheduling Engine**:
  - **Home Delivery**: Delivery address input date & time slot scheduling with free delivery over ₹500.
  - **Store Pickup**: Pickup store branch selection date & time slot scheduling with an extra **₹20 Store Pickup Discount**!
  - **Promotional Coupons**: Supports promo code `DMART10` for an instant 10% discount.
- **🤖 1-Click "Recipe-to-Cart" Express Bundles**: Automatically adds all required fresh ingredients for popular recipes (e.g. *Green Detox Smoothie*, *Artisan Breakfast Kit*, *Royal Basmati Meal*) to cart in 1 click.
- **Order Lifecycle Tracking**: Visual step-by-step progress bar (`Placed` ➔ `Preparing` ➔ `Ready for Pickup` / `Out for Delivery` ➔ `Completed`).
- **Stock Restoration Cancellation**: Customers can cancel orders while in `Placed` or `Preparing` state; cancelled items automatically return to inventory.
- **Return & Exchange Request System**: Submit returns for completed orders within the 7-day return window with item pickers, return reason, proof photo URL, and refund vs. exchange preferences.

### 📦 Store Operations (Staff & Manager Panel)
- **Real-Time Operational Queues**: View pending pickup orders, home delivery queues, and low stock warnings.
- **Status Lifecycle Transitions**: Quick one-click status transitions (`Start Preparing`, `Mark Ready for Pickup`, `Send Out for Delivery`, `Complete Order`).
- **Return / Exchange Approval Queue**: Review customer return requests with proof photos, write manager decision remarks, and choose whether to restock returned goods into active inventory.
- **Quick Stock Inventory Editor**: Edit inventory stock levels directly with automated low-stock highlight warnings.

### 🛡️ Admin & Security Audit Dashboard
- **System Metrics Overview**: Total revenue, total completed orders, pending pickups, pending deliveries, pending returns, and low stock count.
- **RBAC User Manager**: View registered users and promote or demote roles (`CUSTOMER`, `STAFF`, `ADMIN`) dynamically.
- **Product Master CRUD**: Create new product entries or remove existing items.
- **Searchable Security Audit Log**: Comprehensive real-time event log tracking login attempts, status transitions, role changes, and unauthorized route access attempts.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v3, Lucide Icons, Framer Motion, Axios, React Router v6.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Zod Validation, express-rate-limit, CORS.
- **Database / Persistence**: Pure JavaScript File Persistence Engine (`server/data/store.json`) with auto-schema migration and pre-seeded demo records. Ensures 100% zero-configuration run-anywhere execution across Node 18, 20, 22, or 24 on Windows, macOS, and Linux without native C++ compilation errors!

---

## 🔑 Test Credentials & Role Demo Switcher

The top navigation bar contains a **Choose Sign In Role** selector allowing evaluators to sign in or switch roles in 1 click!

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@dmart.com` | `Password123!` | Shop catalog, cart checkout, order tracking, return requests |
| **Store Staff / Manager** | `staff@dmart.com` | `Password123!` | Store operations dashboard (`/staff`), order fulfillment queue, return approvals, stock edits |
| **Admin** | `admin@dmart.com` | `Password123!` | System metrics, user RBAC management (`/admin`), product master CRUD, security audit logs |

---

## 📡 API Architecture & Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account with explicit role selection (`CUSTOMER`, `STAFF`, `ADMIN`)
- `POST /api/auth/login` - Authenticate & obtain JWT bearer token
- `GET /api/auth/me` - Fetch active user profile
- `POST /api/auth/demo-switch` - Evaluator role switch

### Products & Categories (`/api`)
- `GET /api/categories` - List categories
- `GET /api/products` - List products with search, category, and sorting filters
- `POST /api/products` - Create new product (Staff/Admin)
- `PUT /api/products/:id` - Update product details or stock quantity (Staff/Admin)
- `DELETE /api/products/:id` - Remove product (Admin)

### Orders (`/api/orders`)
- `POST /api/orders` - Place new order with fulfillment & time slot validation
- `GET /api/orders/my` - Fetch current user's order history
- `GET /api/orders` - Filterable order queue (Staff/Admin)
- `PUT /api/orders/:id/status` - Advance order lifecycle status (Staff/Admin)
- `POST /api/orders/:id/cancel` - Cancel order & restore stock (Customer/Staff)

### Returns & Exchanges (`/api/returns`)
- `POST /api/returns` - Submit return/exchange request
- `GET /api/returns/my` - Customer return request history
- `GET /api/returns` - Return processing queue (Staff/Admin)
- `PUT /api/returns/:id/process` - Approve/Reject return request with manager remarks (Staff/Admin)

### System Admin & Security (`/api/admin`)
- `GET /api/admin/metrics` - High-level operational metrics
- `GET /api/admin/users` - Registered user list (Admin)
- `PUT /api/admin/users/:id/role` - Update user role (Admin)
- `GET /api/admin/audit-logs` - Searchable security event log (Admin)
