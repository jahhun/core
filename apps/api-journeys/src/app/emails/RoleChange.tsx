import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text
  } from '@react-email/components'
  import { Tailwind } from '@react-email/tailwind'
  import { ReactElement } from 'react'
  
  interface RoleChangeEmailProps {
    name?: string
    role?: string
    email?: string
    teamName?: string
    journeyLink?: string
  }
  
  export const RoleChangeEmail = ({
    name,
    role,
    email,
    teamName,
    journeyLink
  }: RoleChangeEmailProps): ReactElement => {
    const previewText = `Join ${teamName} on Next Steps`
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white my-auto mx-auto font-sans px-2">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                You are now the <strong> {role} </strong> of <strong>{teamName}</strong> on <strong>Next Steps</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello {name},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                {'You have been made '}
                <strong>{role}</strong> of <strong>{teamName}</strong> on <strong>Next Steps</strong>.
              </Text>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#C52D3A] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={journeyLink}
                >
                  Go to the team
                </Button>
              </Section>
              <Text className="text-black text-[14px] leading-[24px]">
                or copy and paste this URL into your browser:{' '}
                <Link href={journeyLink} className="text-blue-600 no-underline">
                  {journeyLink}
                </Link>
              </Text>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                This invitation was intended for{' '}
                <span className="text-black">{email}</span>. If you were not
                expecting this invitation, you can ignore this email.
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }
  
  RoleChangeEmail.PreviewProps = {
    name: 'James',
    role: 'Manager',
    email: 'james@example.com',
    teamName: 'JFP Sol Team',
    journeyLink: 'https://admin.nextstep.is/'
  } satisfies RoleChangeEmailProps
  
  export default RoleChangeEmail
  