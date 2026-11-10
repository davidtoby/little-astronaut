import React, { useId } from 'react';

export function Icon({ name, size = 22, ...props }) {
  const paths = {
    sound: <><path d="M11 4 6 8H3v8h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
    muted: <><path d="M11 4 6 8H3v8h3l5 4Z"/><path d="m16 9 5 6m0-6-5 6"/></>,
    play: <path d="m8 4 12 8-12 8Z"/>,
    pause: <><path d="M8 5v14m8-14v14"/></>,
    replay: <><path d="M4 11a8 8 0 1 1 2 7M4 4v7h7"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    check: <path d="m5 12 5 5L20 7"/>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
    heart: <path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 5 4 10 8 15 4-5 12-10 8-15Z"/>,
    moon: <path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z"/>,
    home: <><path d="m3 11 9-8 9 8M6 10v10h12V10m-9 10v-7h6v7"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.star}</svg>;
}
export function Face({ y = 5, dark = '#414565', happy = true }) {
  return <g transform={`translate(0 ${y})`}>
    <ellipse cx="-12" cy="-4" rx="2.4" ry="3.7" fill={dark}/>
    <ellipse cx="12" cy="-4" rx="2.4" ry="3.7" fill={dark}/>
    <ellipse cx="-22" cy="4" rx="5.5" ry="3" fill="#f59c9f" opacity=".65"/>
    <ellipse cx="22" cy="4" rx="5.5" ry="3" fill="#f59c9f" opacity=".65"/>
    <path d={happy ? 'M-6 6Q0 15 6 6' : 'M-6 8Q0 12 6 8'} fill="none" stroke={dark} strokeWidth="2.2" strokeLinecap="round"/>
  </g>;
}
export function PlanetBody({ id = 'earth', color = '#72c8ef', face = true }) {
  const uid = useId().replace(/:/g, '');
  if (id === 'sun') return <g>
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M-5-48Q0-68 5-48" fill="#f5bf61" transform={`rotate(${i * 30})`}/>)}
    <circle r="46" fill="#ffdc83"/>
    <circle cx="-12" cy="-12" r="27" fill="#ffe9ad" opacity=".4"/>
    {face && <Face y={1}/>}
  </g>;
  return <g>
    <defs>
      <clipPath id={`clip-${uid}`}><circle r="45"/></clipPath>
      <radialGradient id={`planet-${uid}`} cx="28%" cy="23%" r="90%">
        <stop offset="0" stopColor={color}/><stop offset=".65" stopColor={color}/><stop offset="1" stopColor="#30395d" stopOpacity=".3"/>
      </radialGradient>
    </defs>
    {id === 'saturn' && <ellipse rx="69" ry="20" fill="none" stroke="#eed9b5" strokeWidth="12" transform="rotate(-22)"/>}
    <circle r="45" fill={color}/>
    <g clipPath={`url(#clip-${uid})`}>
      {id === 'earth' && <g fill="#97d3a6">
        <path d="M-43-21-24-38-8-34-4-24 7-16 2-3-13 1-19 16-31 10-30-4-43-9Z"/>
        <path d="m13-39 20 5 15 23-9 13-13-3-1-15-16-3Z"/>
        <path d="m14 15 17 2 8 12-11 12-17-7-5-11Z"/>
      </g>}
      {(id === 'jupiter' || id === 'venus') && <g fill="#f5debf" opacity=".72">
        <path d="M-50-28Q0-36 50-25v10Q0-19-50-12Z"/>
        <path d="M-50-6Q0-11 50 0v9Q0 6-50 9Z"/>
        <path d="M-50 22Q0 18 50 26v10Q0 33-50 37Z"/>
      </g>}
      {id === 'jupiter' && <ellipse cx="24" cy="23" rx="11" ry="6" fill="#bd847c"/>}
      {(id === 'mercury' || id === 'mars') && <g fill={id === 'mars' ? '#bc705e' : '#8e94ab'} opacity=".45">
        <circle cx="-20" cy="-22" r="10"/><circle cx="28" cy="13" r="7"/><circle cx="-15" cy="29" r="5"/><circle cx="18" cy="-26" r="5"/>
      </g>}
      {id === 'neptune' && <path d="M-50-17Q-5-30 50-8m-100 36Q0 10 100 20" fill="none" stroke="#aec2fb" strokeWidth="9" opacity=".5"/>}
      <circle r="45" fill={`url(#planet-${uid})`} opacity=".55"/>
      <ellipse cx="-19" cy="-26" rx="12" ry="5" fill="#fff" opacity=".19" transform="rotate(-28 -19 -26)"/>
    </g>
    {id === 'saturn' && <path d="M-64 23Q5 40 65-23" fill="none" stroke="#eed9b5" strokeWidth="10" strokeLinecap="round"/>}
    {face && <Face y={id === 'saturn' ? -4 : 6}/>}
  </g>;
}
export function PlanetPicture({ planet, className = '', face = true }) {
  return <svg className={className} viewBox="-78 -78 156 156" role="img" aria-label={planet.name}><PlanetBody id={planet.id} color={planet.color} face={face}/></svg>;
}
export function RocketBody({ flame = false, upperOnly = false, cabin = false, time = 0 }) {
  return <g>
    {flame && <g transform={`translate(0 ${upperOnly ? 25 : 53})`}>
      <path d={`M-13 0Q-17 18 0 ${43 + Math.sin(time * 19) * 8}Q17 18 13 0Z`} fill="#f1ab79"/>
      <path d={`M-7 0Q-9 15 0 ${29 + Math.sin(time * 21) * 5}Q9 15 7 0Z`} fill="#ffe4a0"/>
    </g>}
    {!upperOnly && <g><path d="M-15 17-30 36v22l19-10m26-31 15 19v22L11 48" fill="#aba0d8"/><rect x="-16" y="18" width="32" height="35" rx="6" fill="#ddd9f0"/><path d="M-15 38h30" stroke="#aaa0cc" strokeWidth="3"/></g>}
    <path d="M-18 22v-43Q-18-45 0-58 18-45 18-21v43Z" fill="#fbf7ed"/>
    <path d="M-18-23Q-16-45 0-58 16-45 18-23Z" fill="#efa48b"/>
    <path d="M8-23v43h9v-43Z" fill="#e8e2d5" opacity=".65"/>
    <circle cy="-8" r="12" fill="#8fc8e2" stroke="#8174b7" strokeWidth="4"/>
    <path d="M-7-11Q-3-16 2-15" fill="none" stroke="#dff5fa" strokeWidth="3" strokeLinecap="round"/>
    {cabin && <g transform="translate(0 -7) scale(.28)"><Face dark="#354568" y={0}/></g>}
    <rect x="-19" y="18" width="38" height="8" rx="3" fill="#8174b7"/>
  </g>;
}
export function RocketPicture() {
  return <svg viewBox="-80 -90 160 180" aria-hidden="true"><g transform="rotate(24)"><RocketBody flame={true}/></g><path d="m-55-35 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#e5c17b"/></svg>;
}
export function Astronaut({ className = '' }) {
  return <svg className={className} viewBox="0 0 160 190" aria-hidden="true">
    <path d="m48 106-21 18q-7 10 4 18l23-13m56-23 23 18q7 10-4 18l-23-13" fill="#e6e3f4" stroke="#c5bedf" strokeWidth="3"/>
    <path d="M52 103h56l8 49H44Z" fill="#f9f7ff" stroke="#c5bedf" strokeWidth="3"/>
    <rect x="49" y="150" width="22" height="26" rx="9" fill="#b3a5d9"/><rect x="90" y="150" width="22" height="26" rx="9" fill="#b3a5d9"/>
    <circle cx="80" cy="63" r="48" fill="#f9f7ff" stroke="#c5bedf" strokeWidth="4"/>
    <rect x="43" y="39" width="74" height="53" rx="26" fill="#434b76"/>
    <path d="M55 55q8-12 21-11" fill="none" stroke="#828bb6" strokeWidth="5" strokeLinecap="round"/>
    <g transform="translate(80 66)"><Face y={0} dark="#fbf2de"/></g>
    <rect x="65" y="113" width="30" height="23" rx="6" fill="#e1dbf3"/><circle cx="72" cy="123" r="3" fill="#eba58e"/><path d="M80 122h8m-8 6h8" stroke="#9b8cbd" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
export function Stars({ width = 900, height = 570, count = 65 }) {
  return <g aria-hidden="true">{Array.from({ length: count }, (_, i) => {
    const x = ((i * 137.508 + 31) % width), y = (i * 83.27 + 29) % height;
    return i % 9 === 0 ? <path key={i} d="M-4 0h8M0-4v8" stroke="#d8cff5" strokeWidth="1.6" opacity=".6" transform={`translate(${x} ${y})`}/> : <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.7 : 1} fill="#dedaf8" opacity={.25 + (i % 4) * .15}/>;
  })}</g>;
}
