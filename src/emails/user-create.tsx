import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  render,
  Text,
} from "@react-email/components";
import type { FC } from "react";

interface UserCreateProps {
  name: string;
  email: string;
  password: string;
}

const UserCreateTemplate: FC<UserCreateProps> = ({ name, email, password }) => (
  <Html>
    <Head />
    <Preview>Your new account has been created!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Welcome to Our Service!</Heading>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Your account has been successfully created. Here are your login
          details:
        </Text>
        <Text style={paragraph}>
          <strong>Email:</strong> <br /> {email}
        </Text>
        <Text style={paragraph}>
          <strong>Password:</strong> <br /> {password}
        </Text>
        <Text style={paragraph}>Thank you for joining us!</Text>
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

export const RenderedUserCreateTemplate = ({
  name,
  email,
  password,
}: UserCreateProps) => {
  return render(
    <UserCreateTemplate name={name} email={email} password={password} />,
  );
};
