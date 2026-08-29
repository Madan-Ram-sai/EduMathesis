import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { loginUserService, registerUserService } from "../services/user.service.js";
import { verifyEmailService } from "../services/email-verification.service.js";

const registeruser = asyncHandler(async (req, res) => {
  const { name,username, email, password, role } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const user = await registerUserService({
    name,
    username,
    email,
    password,
    role,
    avatarLocalPath,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      user,
      "User registered successfully"
    )
  );
});

const verifyEmail = asyncHandler(async (req,res) => {
  const { token } = req.query;

  await verifyEmailService(token);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Email verified successfully"
    )
  )
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const loggedUser = await loginUserService({ email, username, password });

  const options ={
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  }
  return res.status(200)
  .cookie("accessToken", loggedUser.accessToken, options)
  .cookie("refreshToken", loggedUser.refreshToken, options)
  .json(new ApiResponse(200,loggedUser.user,"User logged in successfully"))
});

// profile related controllers
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user; // Assuming user is attached to the request object after authentication

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      "User profile retrieved successfully"
    )
  );
});


export { registeruser, getUserProfile, loginUser };