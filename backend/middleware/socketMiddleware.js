import jwt from "jsonwebtoken";

const socketMiddleware = (socket, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("jwt environment variable is not configured");
    return next(new Error("Server configuration error"));
  }

  if (!socket || !socket.handshake) {
    console.error("Invalid socket object or missing handshake");
    return next(new Error("Invalid socket connection"));
  }

  const token = socket?.handshake?.auth?.token;

  if (!token) {
    console.error("Token is missing from handshake auth");
    return next(new Error("Authentication error: Token is missing"));
  }

  if (typeof token !== "string" || !token?.includes(".")) {
    console.error("Invalid token format");
  }

  if (token?.trim().length === 0) {
    console.error("Token is empty or contains only whitespace");
    return next(new Error("Authentication error: Token is empty"));
  }

  try {
    const verifiedToken = verifyToken(token);

    if (socket?.user) {
      console.warn("Socket user already exists, overwriting");
    }

    socket.user = {
      id: verifiedToken?.id,
      email: verifiedToken?.email,
      iat: verifiedToken?.iat,
      exp: verifiedToken?.exp,
    };

    console.log("Socket user set:", {
      id: socket?.user?.id,
      socketId: socket?.id,
    });

    next();
  } catch (error) {
    let errorMessage = "Authentication error: ";

    switch (error.name) {
      case "TokenExpiredError":
        errorMessage += "Token has expired";
        break;
      case "JsonWebTokenError":
        errorMessage += "Invalid token";
        break;
      case "NotBeforeError":
        errorMessage += "Token not active";
        break;
      default:
        errorMessage += error.message;
    }

    console.error("Token verification failed:", {
      error: error.name,
      message: error.message,
      socketId: socket.id,
    });

    return next(new Error(errorMessage));
  }
};

const verifyToken = (unverifiedToken) => {
  try {
    const decodedToken = jwt.verify(unverifiedToken, process.env.JWT_SECRET);

    if (!decodedToken || typeof decodedToken !== "object") {
      console.error("Decoded token is not a valid object");

      throw new Error("Unable to verify token");
    }

    if (!decodedToken.id) {
      console.error("Token payload missing required `id` field");

      throw new Error("Invalid token payload");
    }

    if (
      typeof decodedToken.id !== "string" &&
      typeof decodedToken.id !== "number"
    ) {
      console.error("Token payload contains invalid user ID type");

      throw new Error("Invalid user ID");
    }

    if (decodedToken.iss && decodedToken.iss !== process.env.JWT_ISSUER) {
      console.error("Token issued by untrusted issuer");
      throw new Error("Invalid token issuer");
    }

    const userIdString = String(decodedToken.id);
    if (userIdString.length === 0 || userIdString.length > 50) {
      console.error("User ID length is invalid");
      throw new Error("Invalid user ID format");
    }

    return decodedToken;
  } catch (error) {
    throw error;
  }
};

export default socketMiddleware;
