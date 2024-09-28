import {
  faCheck,
  faListCheck,
  faPercent,
  faProjectDiagram,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const App = () => {
  return (
    <>
      <div className="header">
        <h1>Dashboard</h1>
        <p>Your Central Hub for Project Success</p>
      </div>

      <div className="row-between">
        <div className="card">
          <p>Number of Projects</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faProjectDiagram} />
            </div>
            <p>2</p>
          </div>
        </div>

        <div className="card">
          <p>Number of Tasks</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faListCheck} />
            </div>
            <p>7</p>
          </div>
        </div>

        <div className="card">
          <p>Completed Tasks</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <p>7</p>
          </div>
        </div>

        <div className="card">
          <p>Tasks Percentage Completed</p>
          <div className="num">
            <div className="icon">
              <FontAwesomeIcon icon={faPercent} />
            </div>
            <p>100%</p>
          </div>
        </div>
      </div>

      <div className="row-between full">
        <div className="row-col">
          <div className="card">
            <p>My Tasks</p>
          </div>
        </div>
        <div className="row-col">
          <div className="card">
            <p>Completed Tasks Chart</p>
          </div>
          <div className="card">
            <p>Graphs and Analysis</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
