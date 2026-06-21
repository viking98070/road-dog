import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Legal.module.css'

const PRIVACY_CONTENT = {
  title: 'Privacy Policy',
  updated: 'June 21, 2026',
  sections: [
    {
      intro: true,
      body: `This Privacy Policy explains how Road Dog ("we," "us," or "our") collects, uses, and protects your information when you use our website and app at roaddogapp.com (the "Service").

This policy is provided for informational purposes and is not a substitute for legal advice.`
    },
    {
      heading: '1. Information We Collect',
      body: `We collect only the information needed to provide the Service:`,
      list: [
        'Account information: your email address and login credentials, used to create and secure your account.',
        "Your picks: the sports leagues and teams you follow, artists and shows you're interested in, and your home city. We use this to find and recommend trip combos for you.",
        'Contact information for notifications: your email address and, if you enable them, push notification permissions, used to send you updates about events, trips, and your account.',
      ],
      footer: "We do not collect analytics data, advertising identifiers, or browsing behavior beyond what's needed to operate the Service. We do not maintain a separate marketing email list outside of product notifications."
    },
    {
      heading: '2. How We Use Your Information',
      body: 'We use the information we collect to:',
      list: [
        'Create and maintain your account',
        'Generate personalized trip combo recommendations based on your picks',
        'Send you notifications about events, trip opportunities, and account-related updates',
        'Respond to support requests',
        'Maintain the security and functioning of the Service',
      ]
    },
    {
      heading: '3. How We Share Your Information',
      body: `We do not sell your personal information.

We share limited information with third-party services necessary to operate the Service, including:`,
      list: [
        'Supabase, our database and authentication provider, which stores your account and pick data',
        'Ticketmaster, ESPN, and College Football Data, whose APIs we use to source event and game data. These services do not receive your personal account information as part of this data sourcing.',
      ],
      footer: 'We may disclose information if required by law or to protect the rights, safety, or property of Road Dog or others.'
    },
    {
      heading: '4. Data Retention',
      body: 'We retain your account information for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us (see Section 8).'
    },
    {
      heading: '5. Your Choices',
      list: [
        "You can update or delete your picks (teams, shows, home city) at any time within the app's settings.",
        'You can opt out of push notifications through your device settings, and out of email notifications through your account settings.',
        'You can request deletion of your account by contacting us.',
      ]
    },
    {
      heading: "6. Children's Privacy",
      body: 'The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.'
    },
    {
      heading: '7. International Users',
      body: 'Road Dog is available to users globally. By using the Service, you understand that your information may be processed in the United States, where our service providers operate.'
    },
    {
      heading: '8. Contact Us',
      body: 'If you have questions about this Privacy Policy or your data, contact us at:',
      contact: 'support@roaddogapp.com'
    },
    {
      heading: '9. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the Service or by email.'
    },
  ]
}

const TERMS_CONTENT = {
  title: 'Terms of Use',
  updated: 'June 21, 2026',
  sections: [
    {
      intro: true,
      body: `Welcome to Road Dog. These Terms of Use ("Terms") govern your access to and use of roaddogapp.com and the Road Dog app (the "Service"). By creating an account or using the Service, you agree to these Terms.

This document is provided for informational purposes and is not a substitute for legal advice.`
    },
    {
      heading: '1. The Service',
      body: 'Road Dog helps sports and music fans discover trips where away games, concerts, and other events overlap in the same city, based on the teams, artists, and home city you tell us about.'
    },
    {
      heading: '2. Your Account',
      body: "To use most features of the Service, you'll need to create an account. You agree to:",
      list: [
        'Provide accurate information when creating your account',
        'Keep your login credentials secure',
        'Notify us of any unauthorized use of your account',
      ],
      footer: 'You must be at least 13 years old to use the Service.'
    },
    {
      heading: '3. Acceptable Use',
      body: 'You agree not to:',
      list: [
        'Use the Service for any unlawful purpose',
        'Attempt to interfere with, disrupt, or gain unauthorized access to the Service or its underlying systems',
        'Scrape, copy, or redistribute data from the Service in bulk',
        'Impersonate any person or entity',
      ],
      footer: 'We reserve the right to suspend or terminate accounts that violate these Terms.'
    },
    {
      heading: '4. Event and Ticketing Data',
      body: `Road Dog displays event information sourced from third parties, including Ticketmaster, ESPN, and College Football Data. We do not control, guarantee, or take responsibility for the accuracy of this data, including event dates, venues, lineups, or availability. Always confirm event details and purchase tickets directly through the official source.

Road Dog is not a ticket seller. Any links to purchase tickets, book travel, or reserve accommodations direct you to third-party websites, which have their own terms and privacy practices independent of Road Dog.`
    },
    {
      heading: '5. Intellectual Property',
      body: 'The Service, including its design, features, and content (excluding third-party event data and team/artist names, which belong to their respective owners), is owned by Road Dog. You may not copy, modify, or distribute any part of the Service without our permission.'
    },
    {
      heading: '6. Disclaimers',
      body: 'The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that trip recommendations will always be accurate or complete.'
    },
    {
      heading: '7. Limitation of Liability',
      body: 'To the fullest extent permitted by law, Road Dog is not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including any losses related to travel plans, ticket purchases, or event attendance based on information provided through the Service.'
    },
    {
      heading: '8. Changes to the Service',
      body: 'We may modify, suspend, or discontinue any part of the Service at any time, with or without notice.'
    },
    {
      heading: '9. Termination',
      body: 'You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you violate these Terms.'
    },
    {
      heading: '10. Governing Law',
      body: 'These Terms are governed by the laws of the United States, without regard to conflict of law principles.'
    },
    {
      heading: '11. Contact Us',
      body: 'If you have questions about these Terms, contact us at:',
      contact: 'support@roaddogapp.com'
    },
    {
      heading: '12. Changes to These Terms',
      body: 'We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.'
    },
  ]
}

export default function Legal({ type }) {
  const navigate = useNavigate()
  const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Road<span>Dog</span>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{content.title}</h1>
        <div className={styles.updated}>Last updated: {content.updated}</div>

        {content.sections.map((section, i) => (
          <div key={i} className={styles.section}>
            {section.heading && <h2 className={styles.heading}>{section.heading}</h2>}
            {section.body && section.body.split('\n\n').map((para, j) => (
              <p key={j} className={styles.body}>{para}</p>
            ))}
            {section.list && (
              <ul className={styles.list}>
                {section.list.map((item, k) => <li key={k}>{item}</li>)}
              </ul>
            )}
            {section.footer && <p className={styles.body}>{section.footer}</p>}
            {section.contact && <p className={styles.contact}>{section.contact}</p>}
          </div>
        ))}

        <div className={styles.crossLink}>
          {type === 'terms' ? (
            <span onClick={() => navigate('/privacy')}>View our Privacy Policy →</span>
          ) : (
            <span onClick={() => navigate('/terms')}>View our Terms of Use →</span>
          )}
        </div>
      </main>
    </div>
  )
}
