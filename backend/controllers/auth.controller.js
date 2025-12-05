const { storage } = require("../storage");
const { verifyPassword, generateToken } = require("../auth");

async function login(req, res) {
  // For now, we'll skip schema validation since it requires @shared/schema
  // In a real implementation, you would add validation here
  const { email, password, type } = req.body;
  
  if (!email || !password || !type) {
    return res.status(400).json({ message: "Email, password, and type are required" });
  }

  let user;

  switch (type) {
    case "ADMIN":
      user = await storage.getAdminByEmail(email);
      break;
    case "MSME":
      user = await storage.getMSMEByEmail(email);
      break;
    case "AGENCY":
      user = await storage.getTestingAgencyByEmail(email);
      break;
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    type,
    role: user.role,
  });
  
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      type,
      role: user.role,
    },
  });
}

module.exports = { login };

