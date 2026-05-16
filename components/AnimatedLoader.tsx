import React from 'react';

export default function AnimatedLoader() {
  return (
    <div className="cssload-container">
      <ul className="cssload-flex-container">
        <li>
          <span className="cssload-loading cssload-one" />
          <span className="cssload-loading cssload-two" />
          <span className="cssload-loading-center" />
        </li>
      </ul>
      
      {/* Loading text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <div className="text-white text-lg font-medium">Looaading...</div>
        <div className="text-gray-400 text-sm mt-2">Please wait while we process your request</div>
      </div>
      
      <style jsx>{`
        .cssload-container * {
          box-sizing: border-box;
        }

        .cssload-container {
          margin: 38px auto 0 auto;
          max-width: 1048px;
        }

        .cssload-container ul li {
          list-style: none;
        }

        .cssload-flex-container {
          display: flex;
          display: -o-flex;
          display: -ms-flex;
          display: -webkit-flex;
          display: -moz-flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-around;
        }

        .cssload-flex-container li {
          padding: 19px;
          height: 188px;
          width: 188px;
          margin: 56px 38px;
          position: relative;
          text-align: center;
        }

        .cssload-loading-center {
          display: inline-block;
          position: absolute;
          background: #ff0000;
          height: 56px;
          width: 56px;
          left: 68px;
          top: 69px;
          transform: rotate(45deg);
          border-radius: 6px;
          animation: pulse 1.3s ease infinite;
        }

        .cssload-loading {
          display: inline-block;
          position: relative;
          width: 141px;
          height: 141px;
          margin-top: 6px;
          transform: rotate(45deg);
        }

        .cssload-loading:after, .cssload-loading:before {
          position: absolute;
          content: '';
          height: 19px;
          width: 19px;
          display: block;
          top: 0;
          background: #ff5252;
          border-radius: 6px;
        }

        .cssload-loading:after {
          right: 0;
          animation: square-tr 2.6s ease infinite;
          animation-delay: 0.1625s;
        }

        .cssload-loading:before {
          animation: square-tl 2.6s ease infinite;
          animation-delay: 0.1625s;
        }

        .cssload-loading.cssload-two {
          position: relative;
          top: -150px;
        }

        .cssload-loading.cssload-two:after, .cssload-loading.cssload-two:before {
          bottom: 0;
          top: initial;
        }

        .cssload-loading.cssload-two:after {
          animation: square-br 2.6s ease infinite;
          animation-direction: reverse;
        }

        .cssload-loading.cssload-two:before {
          animation: square-bl 2.6s ease infinite;
          animation-direction: reverse;
        }

        @keyframes square-tl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, 117.5px);
          }
          50% {
            transform: translate(117.5px, 117.5px);
          }
          75% {
            transform: translate(117.5px, 0);
          }
        }

        @keyframes square-bl {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0, -117.5px);
          }
          50% {
            transform: translate(117.5px, -117.5px);
          }
          75% {
            transform: translate(117.5px, 0);
          }
        }

        @keyframes square-tr {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-117.5px, 0);
          }
          50% {
            transform: translate(-117.5px, 117.5px);
          }
          75% {
            transform: translate(0, 117.5px);
          }
        }

        @keyframes square-br {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-117.5px, 0);
          }
          50% {
            transform: translate(-117.5px, -117.5px);
          }
          75% {
            transform: translate(0, -117.5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(inherit) rotate(45deg);
          }
          75% {
            transform: scale(0.25) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
