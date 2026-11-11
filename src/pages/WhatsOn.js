import React from 'react'
import { useParams } from 'react-router-dom'
import WhosPlaying, { cityFromSlug } from './WhosPlaying'

// #25: Who's Playing for everyone. /whats-on and /whats-on/<city-slug>
// (e.g. /whats-on/las-vegas opens Las Vegas, this weekend). Signed-out
// visitors get the public version; people with trips get the normal screen.
export default function WhatsOn({ session, signedIn }) {
  const { city } = useParams()
  return <WhosPlaying session={session} publicView={!signedIn} initialCity={cityFromSlug(city)} />
}
