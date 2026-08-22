# SECURITY.md - Security Policy & Vulnerability Mitigation

## Security Overview

The **Mini D-Mart Grocery Store Application** implements enterprise-grade security controls designed to protect user identity, ensure role integrity, prevent unauthorized data access, and track critical store operations through an immutable audit trail system.

---

## 1. Authentication & Session Security

- **Password Hashing**: User passwords are encrypted using `bcryptjs` with salted rounds (`saltFactor = 10`) prior to storage. Plaintext passwords are never logged or stored.
- **JSON Web Tokens (JWT)**: Authentication utilizes stateless signed JWT tokens containing strictly non-sensitive user metadata (`id`, `email`, `role`). Tokens expire in 7 days.
- **Header-Based Authorization**: Client requests pass tokens in standard HTTP `Authorization: Bearer <TOKEN>` headers.

---

## 2. Role-Based Access Control (RBAC) Architecture

Access to system endpoints is strictly guarded by server-side middleware (`requireRole`).

### Permission Matrix

| Resource / Action | Customer | Store Staff / Manager | Admin |
| :--- | :---: | :---: | :---: |
| Browse Products & Categories | ✅ | ✅ | ✅ |
| Checkout & Place Order | ✅ | ✅ | ✅ |
| View Own Order Lifecycle | ✅ | ✅ | ✅ |
| Submit Return / Exchange | ✅ | ✅ | ✅ |
| View All Store Orders Queue | ❌ | ✅ | ✅ |
| Update Order Fulfillment Status | ❌ | ✅ | ✅ |
| Approve / Reject Return Requests | ❌ | ✅ | ✅ |
| Update Inventory Stock Levels | ❌ | ✅ | ✅ |
| Manage User Roles (RBAC) | ❌ | ❌ | ✅ |
| Product Master CRUD (Add/Delete) | ❌ | ❌ | ✅ |
| View System Security Audit Logs | ❌ | ❌ | ✅ |

> **Security Guard**: Attempting to bypass client UI controls to invoke restricted API endpoints returns `403 Forbidden` and immediately records an entry in the system `audit_logs` table.

---

## 3. Real-Time Audit Logging System

All sensitive and high-value system events generate an audit log record containing:
- Timestamp (UTC)
- User ID & Full Name
- User Role (`CUSTOMER`, `STAFF`, `ADMIN`, or `SYSTEM`)
- Action Event Code (`USER_LOGIN_SUCCESS`, `ORDER_CREATED`, `ORDER_STATUS_UPDATED`, `RETURN_PROCESSED`, `UNAUTHORIZED_ACCESS_ATTEMPT`, `USER_ROLE_CHANGED`)
- Event Details & IP Address

Audit logs can be searched and inspected in real time by System Admins via the **Admin & Security Audit Dashboard**.

---

## 4. Rate Limiting & Input Validation

- **Rate Limiting**: Express routes for authentication (`/api/auth/login` and `/api/auth/register`) are throttled using `express-rate-limit` (100 requests per 15-minute window per IP) to mitigate brute force attacks.
- **Input Sanitization & Schema Validation**: All request bodies are strictly sanitized and parsed using `Zod` schemas before execution, preventing SQL/JSON injection, parameter pollution, and schema drift.
- **CORS Policies**: Explicit Cross-Origin Resource Sharing (CORS) rules configured on the Express backend server.

---

## 5. Test Credentials

For evaluation purposes, pre-configured accounts are provided:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@dmart.com` | `Password123!` |
| **Store Staff / Manager** | `staff@dmart.com` | `Password123!` |
| **Admin** | `admin@dmart.com` | `Password123!` |

*(Note: The top navigation bar also features a 1-click **Role Switcher Demo** button for instant evaluator role testing).*
