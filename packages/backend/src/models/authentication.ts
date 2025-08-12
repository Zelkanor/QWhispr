/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */

/**
 * Node Modules
 */
import {z} from 'zod';


 export const registerSchema = z.object({
    username: z.string().trim().min(3, { message: 'Username is required' }).max(50, { message: 'Username must be less than 50 characters' }).regex(/^[a-zA-Z0-9_.]+$/, { message: 'Only letters, numbers, underscores (_), and periods (.) allowed' }),
    email: z.string().trim().email({ message: 'Invalid email address' }),
    password: z.string().trim().min(8, "Password must be at least 8 characters long").max(25,"Password cannot be more than 25 characters") .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,])[A-Za-z\d@$!%*?&,]{8,}$/,
        {
          message: "Must include: 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)"
        }
      ),
     deviceFingerprint: z.string().trim().min(3, { message: 'Device fingerprint is required' }).max(80, { message: 'Device fingerprint invalid' }),
     });

export const loginSchema =registerSchema.omit({username: true})




export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;

