import './dayplanner.css'
import { useEffect, useState } from "react"
import ProgressPie from '../progresspie/ProgressPie'

type DayPlannerProps = {
  day: string;
  items: string[];
};

export default function DayPlanner({ day, items }: DayPlannerProps) {
  const [checked, setChecked] = useState<boolean[]>([]);
  const [message, setMessage] = useState<string>(""); 

  useEffect(() => {
    setChecked(Array(items.length).fill(false));
  }, [items]);

 

  const completed = checked.filter(Boolean).length;
  const average =
    items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

    useEffect(() => {
  if (average === 0) {
    setMessage("Nothing done yet — pick one small thing to start.");
  } else if (average > 0 && average < 20) {
    setMessage("You’ve started, that’s the hardest part. Keep going.");
  } else if (average >= 20 && average < 40) {
    setMessage("Good momentum. You’re warming up nicely 💪");
  } else if (average >= 40 && average < 60) {
    setMessage("Nice progress — you’re about halfway there.");
  } else if (average >= 60 && average < 80) {
    setMessage("Solid work. Stay focused and finish strong 🔥");
  } else if (average >= 80 && average < 100) {
    setMessage("Almost there — a few more and you’re done 🚀");
  } else {
    setMessage("Everything done. That’s a wrap 🏆");
  }
}, [average]);



  return (
    <section className="dayplanner-container">
      <div>
        <h1>{day}</h1>
       <p className="day-subtitle">
  Down here you can tick off the things you want to get done today. 
  No pressure — just focus on making a bit of progress.
</p>

      </div>

      <div className="dayplanner-main">
        <ul className="dayplanner-list">
          {items.map((item, index) => (
            <li key={index}>
              <label className="task-row">
                <input
                  type="checkbox"
                  checked={checked[index] ?? false}
                  onChange={() =>
                    setChecked(prev =>
                      prev.map((v, i) => (i === index ? !v : v))
                    )
                  }
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="pieChart">
          <div className="pie-fixed">
            <div className="pie-meta">
              {completed} / {items.length} completed
            </div>
            <ProgressPie percentage={average} />
          </div>

          <div className="pie-message">
            {message}
          </div>
      </div>


      </div>
    </section>
  );
}
