import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import cors from "cors";
import { productsRouter } from "./routes/productsRouter"; // Sample route
import AppError from "./utils/AppError";
import globalErrorHandler from "./controllers/errorController";

const app = express();
/*
Purpose: Sets up the web server.
Key Features:
Handles HTTP requests and responses.
Provides routing for different endpoints.
Integrates middleware for extended functionality
*/
// Middleware
app.use(helmet());
/*
Purpose: Enhances API security by setting HTTP headers.
Key Features:
Prevents common vulnerabilities like clickjacking, XSS, and MIME sniffing.
Example: It sets X-Content-Type-Options to nosniff to prevent browsers from interpreting files as a different MIME type.
 */

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
/*morgan
Purpose: Logs HTTP requests for debugging and monitoring.
Usage:
Development mode (dev): Minimal output, showing concise colored logs.
Production mode (combined): Detailed logs, including timestamps, status codes, and response times.
 */

app.use(express.json({ limit: "10kb" }));
/*. express.json()
Purpose: Parses incoming JSON payloads in requests.
Usage:
Restricts payload size to 10kb to prevent Denial of Service (DoS) attacks.
 */

app.use(express.urlencoded({ extended: false }));
/*
express.urlencoded()
Purpose: Parses incoming URL-encoded payloads (e.g., form submissions).
Usage:
extended: false means it only handles simple objects, not nested ones.
 */
app.use(cookieParser());
/*
Purpose: Parses cookies in incoming requests.
Use Case:
Enables the server to access cookies easily, which is essential for authentication and session management.
*/
app.use(mongoSanitize());
/*
express-mongo-sanitize
Purpose: Prevents NoSQL Injection attacks.
How:
Strips out $ and . from request data, as these characters can be used to manipulate MongoDB queries.

*/
app.use(xss());
/*
xss-clean
Purpose: Protects against Cross-Site Scripting (XSS) attacks.
How:
Sanitizes input to ensure that malicious scripts are not injected into HTML.
 */
app.use(cors({ credentials: true, origin: true }));
/*
Purpose: Enables Cross-Origin Resource Sharing (CORS).
Use Case:
Allows the API to accept requests from different domains.
credentials: true: Supports cookies and authentication headers across origins.
origin: true: Dynamically allows all origins.
 */
app.use((req, res, next) => {
  console.log(req.url);
  next();
});
app.use("/api/products", productsRouter);

app.all("*", (req, res, next) => {
  console.log(req.url);
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/*
When an error occurs in the application, 
Express.js will automatically call the next middleware function in the chain that has four arguments.
Note that this middleware will only catch errors that occur in the application after it's been added to the middleware chain. 
If an error occurs before this middleware is added, it will not be caught by this middleware.
*/

app.use(globalErrorHandler);

export default app;
