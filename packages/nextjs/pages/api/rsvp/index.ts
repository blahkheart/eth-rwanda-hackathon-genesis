import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  ethereum: z.string().optional(),
  class: z.string().min(1, "Class is required"),
  captchaToken: z.string().min(1, "Captcha token is required"),
});

type RegisterData = z.infer<typeof registerSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; message: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const data: RegisterData = registerSchema.parse(req.body);
    console.log(data);

    // Verify the captcha token with the captcha provider
    const captchaVerificationResponse = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: "YOUR_RECAPTCHA_SECRET_KEY", // Replace with your secret key
        response: data.captchaToken,
      },
    });

    if (!captchaVerificationResponse.data.success) {
      return res.status(400).json({ success: false, message: "Invalid captcha" });
    }

    // Define the necessary parameters for the RSVP API call
    const networkId = 1; // Example network ID, replace with actual
    const lockAddress = "0xYourLockAddress"; // Replace with actual lock address

    // Prepare the data for the RSVP API call
    const requestData = JSON.stringify({
      recipient: data.ethereum,
      email: data.email,
      data: {
        name: data.name,
        phone: data.phone,
        class: data.class,
      },
    });

    // Configure the request
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://locksmith.unlock-protocol.com/v2/rsvp/${networkId}/${lockAddress}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        captcha: data.captchaToken, // Include captcha token in headers
      },
      data: requestData,
    };

    // Make the API call
    const response = await axios.request(config);

    if (response.status === 200) return res.status(200).json({ success: true, message: "Registration successful" });

    return res.status(response.status).json({ success: false, message: "Failed to register with Locksmith API" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: "An unexpected error occurred" });
  }
}
