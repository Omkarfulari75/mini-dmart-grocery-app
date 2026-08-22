# 🛡️ SECURITY.md — Mini D-Mart Security & Audit Policy

## Security Architecture Overview
Mini D-Mart implements multi-layered security practices following OWASP standards for full-stack web application defense.

---

## 1. Authentication & Session Security
- **JSON Web Tokens (JWT)**: Signed with high-entropy secrets (`JWT_SECRET`) with configurable expiration.
- **Password Hashing**: Passwords stored using `bcryptjs` with salt rounds (`10`). Raw passwords are never logged or stored in plain text.
- **Role-Based Access Control (RBAC)**: Strict role scoping (`CUSTOMER`, `STAFF`, `ADMIN`) enforced at both frontend router guards and backend middleware (`verifyToken`, `authorizeRoles`).

---

## 2. Input Validation & Data Sanitization
- **Zod Validation Schemas**: Rigid request payload schemas prevent SQL/NoSQL injection, prototype pollution, and malformed parameter attacks.
- **Param Sanitization**: Integer conversion and string trimming on all numerical inputs (e.g., prices, stock quantities, product IDs).

---

## 3. Real-Time System Security Audit Logging
All security-sensitive operations generate timestamped audit entries recorded in the immutable Audit Log system:
- `USER_LOGIN_SUCCESS` / `USER_LOGIN_FAILED`
- `USER_REGISTERED`
- `USER_ROLE_PROMOTED` / `USER_ROLE_DEMOTED`
- `ORDER_CREATED` / `ORDER_CANCELLED`
- `RETURN_REQUESTED` / `RETURN_PROCESSED`

Audit entries capture: `Timestamp`, `User ID`, `User Name`, `Role`, `Action Type`, `Detailed Description`, and `IP Address`.

---

## 4. API & Network Protection
- **CORS Policy**: Configured cross-origin access controls.
- **Rate Limiting**: Protects authentication and order creation endpoints against brute-force and DDoS attacks.
- **Error Shielding**: Server error responses sanitize internal stack traces in production to prevent information disclosure.

---

## 5. Vulnerability Disclosure
If you discover a security vulnerability within Mini D-Mart, please report it directly to the repository maintainer:
- **Email**: `omkar@dmart.com` / `admin@dmart.com`
- **GitHub**: [https://github.com/Omkarfulari75/mini-dmart-grocery-app](https://github.com/Omkarfulari75/mini-dmart-grocery-app)
