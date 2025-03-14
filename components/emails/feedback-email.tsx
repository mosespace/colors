import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const FeedbackEmail = ({
  message,
  userName,
}: {
  message: string;
  userName?: string | null | undefined;
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Colors Inc Feedback Received</Preview>
      <Body style={{ padding: '20px' }}>
        <Container>
          <Heading className="text-2xl font-bold text-gray-800">
            New Feedback Received
          </Heading>
          <Section className="mt-4">
            <Text className="text-gray-700">Message: {message}</Text>
            {userName && (
              <Text className="text-gray-600 text-sm">
                From User: {userName}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FeedbackEmail;
