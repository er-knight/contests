import { useEffect, useState } from 'react'


function formatDate(isoFormatStr) {
  const date = new Date(isoFormatStr)
  let options = {
    hour12: true, hour: "numeric", minute: "2-digit"
  }
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString(navigator.language, options).replace('am', 'AM').replace('pm', 'PM')}`
  }
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString(navigator.language, options).replace('am', 'AM').replace('pm', 'PM')}`
  }
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString(navigator.language, options).replace('am', 'AM').replace('pm', 'PM')}`
  }
  options = { ...options, weekday: "short", year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleString(navigator.language, options).replace('am', 'AM').replace('pm', 'PM')
}

function formatSeconds(_seconds, includeSeconds=false) {
  const days = Math.floor(_seconds / (3600 * 24))
  _seconds = _seconds % (3600 * 24)
  const hours = _seconds / 3600
  _seconds = _seconds % 3600
  const minutes = _seconds / 60
  const seconds = _seconds % 60

  return `${days >= 1 ? days.toString() + (days > 1 ? ' days, ' : ' day, ') : ''}${Math.floor(hours).toString().padStart(2, '0')} : ${Math.floor(minutes).toString().padStart(2, '0')}${includeSeconds ? ' : ' + Math.floor(seconds).toString().padStart(2, '0') : ''}`
}

function compareDates(first, second) {
  const firstDate = new Date(first)
  const secondDate = new Date(second)
  return firstDate - secondDate
}

function Card({ platform, title, url, startTime, duration, isVisible }) {

  const [countdownSeconds, setCountdownSeconds] = useState(0)
  const [status, setStatus] = useState("")

  const contestStartTime = new Date(startTime)
  const contestEndTime = new Date(startTime)
  contestEndTime.setSeconds(contestStartTime.getSeconds() + duration)

  useEffect(() => {
    const now = new Date()
    if (contestStartTime > now) {
      setStatus("Upcoming")
      setCountdownSeconds(((contestStartTime - now) / 1000).toFixed())
    } else if (contestStartTime <= now && now <= contestEndTime) {
      setStatus("Ongoing")
      setCountdownSeconds(((contestEndTime - now) / 1000).toFixed())
    } else { // contestEndTime > now
      setStatus("Completed")
      setCountdownSeconds(0)
    }
    const countdownTimer = setInterval(() => {
      const now = new Date()
      if (((contestStartTime - now) / 1000).toFixed() == 5 * 60) {
        new Notification(`${title} about to start in 5 minutes.`)
      }  
      if (contestStartTime > now) {
        setStatus("Upcoming")
      } else if (contestStartTime <= now && now <= contestEndTime) {
        setStatus("Ongoing")
      } else { // contestEndTime > now
        setStatus("Completed")
        clearInterval(countdownTimer)
      }
      setCountdownSeconds(prevCountdownSeconds => prevCountdownSeconds - 1)
    }, 1000)
    return () => clearInterval(countdownTimer)
  }, [status])
  
  return (
    <div className={`${isVisible ? 'flex' : 'hidden'} flex-col border p-2 gap-1 w-full hover:border-gray-950`}>
      <div className="flex gap-1 flex-wrap">
        <div>{platform}</div>
        <div className="flex gap-2">
          <div className={`inline-flex items-center text-sm border px-1 ${
            status == "Completed" ? "bg-red-300" : "bg-green-200"}`
          }>{status}</div>
          {
            status !== "Completed" && <div className="inline-flex items-center text-sm border px-1">
              {formatSeconds(countdownSeconds, true)}
            </div>
          }
        </div>
      </div>
      <div className="text-xl text-wrap underline decoration-1 decoration-gray-200 hover:decoration-gray-950"><a href={url}>{title}</a></div>
      <div className="flex gap-2 flex-wrap">
        <div className="border px-1">{formatDate(startTime)}</div>
        <div className="border px-1">{formatSeconds(duration)}</div>
      </div>
    </div>
  )
}

function App() {
  const [contests, setContests] = useState([])
  const platforms = ["AtCoder", "CodeChef", "Codeforces", "GeeksforGeeks", "LeetCode"]
  const [selectedPlatforms, setSelectedPlatforms] = useState({})
  const url = import.meta.env.VITE_API_URL

  useEffect(() => {
    setSelectedPlatforms(
      platforms.reduce((_selectedPlatforms, platform) => {
        return {
          ..._selectedPlatforms, [platform]: true,
        }
      }, {})
    )
    fetch(url).then(
      response => response.json()
    ).then(
      response => setContests(response)
    )
  }, [])

  return (
    <div className="tracking-tight font-['Atkinson_Hyperlegible'] flex flex-col items-center h-screen px-1 py-2">
      <div className="flex px-2 items-end justify-center flex-wrap gap-2">
        <div className="text-6xl tracking-tighter">Contests</div>
        <div className="border p-2 mb-2 h-8 inline-flex items-center text-xl tracking-tighter decoration-1 decoration-gray-200 underline hover:decoration-gray-950 hover:border-gray-950">
          <a href="https://github.com/er-knight/contests">GitHub</a>
        </div>
      </div>
      <div className="p-1 text-center">
        <span>Built with </span>
        <a href="https://github.com/er-knight/contests/tree/main/app/src/App.jsx" className="decoration-1 decoration-gray-200 underline hover:decoration-gray-950">React</a>
        <span> and </span>
        <a href="https://github.com/er-knight/contests/tree/main/app/src/App.jsx" className="decoration-1 decoration-gray-200 underline hover:decoration-gray-950">Tailwind CSS</a>
        <span> with little help from </span>
        <a href="https://github.com/er-knight/contestsdb" className="decoration-1 decoration-gray-200 underline hover:decoration-gray-950">Python</a>
      </div>
      <div className="flex flex-wrap w-full items-center justify-center p-1 mb-2 gap-1">
        {
          platforms.map(platform => (
            <div
              key={platform.toLowerCase()}
              className={`border px-2 py-1 hover:cursor-pointer hover:border-gray-950 ${selectedPlatforms[platform]
                ? 'bg-blue-200'
                : 'bg-white'
                }`}
              onClick={() => setSelectedPlatforms({
                ...selectedPlatforms, [platform]: !selectedPlatforms[platform]
              })}
            >{platform}</div>
          ))
        }
      </div>
      <div className="grow overflow-auto flex flex-col w-fit  px-1 gap-1 md:w-[752px]">
        {
          [].concat(contests).sort(
            (a, b) => compareDates(a.start_time, b.start_time)
          ).map(contest => (
            <Card
              key={contest.id}
              platform={contest.platform}
              title={contest.title}
              url={contest.url}
              startTime={contest.start_time}
              duration={contest.duration}
              isVisible={selectedPlatforms[contest.platform]}
            ></Card>
          ))
        }
      </div>
    </div>
  )
}

export default App
