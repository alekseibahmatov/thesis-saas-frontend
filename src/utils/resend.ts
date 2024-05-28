import {Resend} from "resend";
import {env} from "~/env";

const resend = new Resend(env.RESEND_TOKEN);

export const sendEmail = async (email: string, subject: string, html: string) => {
    await resend.emails.send({
        from: 'No-Reply <no-reply@framify.store>',
        to: email,
        subject,
        html
    })
}