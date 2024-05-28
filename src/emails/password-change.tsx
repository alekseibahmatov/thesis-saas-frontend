import { type FC } from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Preview,
  render,
} from "@react-email/components";

interface PasswordChangeProps {
  name: string;
  password: string;
}

const PasswordChangeTemplate: FC<PasswordChangeProps> = ({
  name,
  password,
}) => (
  <Html>
    <Head />
    <Preview>Your password has been changed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Password Change Notification</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Your password has been successfully changed.
        </Text>
        {!!password && (
          <Text style={paragraph}>
            <strong>New password:</strong> <br /> {password}
          </Text>
        )}
        <Text style={paragraph}>
          If you did not request this change, please contact our support team
          immediately.
        </Text>
        <Text style={paragraph}>Best regards,</Text>
        <Text style={paragraph}>The Team</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "20px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  maxWidth: "600px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const heading = {
  color: "#333333",
  fontSize: "24px",
  marginBottom: "20px",
};

const paragraph = {
  color: "#555555",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "10px 0",
};

export const RenderedPasswordChangeTemplate = ({
  name,
  password,
}: PasswordChangeProps) => {
  return render(<PasswordChangeTemplate name={name} password={password} />);
};
