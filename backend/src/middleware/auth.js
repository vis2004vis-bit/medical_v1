import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export async function authCognitoMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Missing token" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.user = {
        username:
          decoded["cognito:username"] ||
          decoded.username ||
          decoded.email ||
          decoded.sub,
        email: decoded.email,
        sub: decoded.sub,
      };
      next();
    });
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// import jwt from 'jsonwebtoken'

// export function authMiddleware(req, res, next) {
//   try {
//     const header = req.headers.authorization || ''
//     const token = header.startsWith('Bearer ') ? header.slice(7) : ''
//     if (!token) return res.status(401).json({ message: 'Unauthorized' })
//     const payload = jwt.verify(token, process.env.JWT_SECRET)
//     req.user = payload
//     next()
//   } catch (e) {
//     return res.status(401).json({ message: 'Invalid token' })
//   }
// }
