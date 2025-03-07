import React, { useEffect, useState, useRef } from 'react';
import './Drumkit.css';
import 'font-awesome/css/font-awesome.min.css';
import { TimelineMax, Elastic, Expo } from 'gsap';

const SVGDrumKit = () => {
  const [sequencerVisible, setSequencerVisible] = useState(false);
  const [sequencerOn, setSequencerOn] = useState(false);
  const [bpm, setBpm] = useState(150);
  const [beat, setBeat] = useState(1);
  const intervalRef = useRef(null);
  const crashCymbolRef = useRef(null);
  const crashAudioRef = useRef(null);
  const rightTomDrumRef = useRef(null);
  const smallTomAudioRef = useRef(null);
  const leftTomDrumRef = useRef(null);
  const bigTomAudioRef = useRef(null);
  const floorTomDrumRef = useRef(null);
  const floorTomAudioRef = useRef(null);
  const snareDrumRef = useRef(null);
  const snareAudioRef = useRef(null);
  const kickDrumRef = useRef(null);
  const kickAudioRef = useRef(null);
  const hiHatRef = useRef(null);
  const hiHatClosedAudioRef = useRef(null);

  useEffect(() => {
    const crashtl = new TimelineMax({ paused: true });
    crashtl.to(crashCymbolRef.current, 0.1, {
      rotation: 8,
      transformOrigin: "50% 50%"
    }).to(crashCymbolRef.current, 1.5, {
      rotation: 0,
      transformOrigin: "50% 50%",
      ease: Elastic.easeOut.config(2.5, 0.3)
    });

    const rightTomtl = new TimelineMax({ paused: true });
    rightTomtl.to(rightTomDrumRef.current, 0.1, {
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }).to(rightTomDrumRef.current, 0.1, {
      scaleY: 0.95,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }, '0').to(rightTomDrumRef.current, 0.4, {
      scale: 1,
      transformOrigin: "50% 50%",
      ease: Elastic.easeOut
    });

    const leftTomtl = new TimelineMax({ paused: true });
    leftTomtl.to(leftTomDrumRef.current, 0.1, {
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }).to(leftTomDrumRef.current, 0.1, {
      scaleY: 0.95,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }, '0').to(leftTomDrumRef.current, 0.4, {
      scale: 1,
      transformOrigin: "50% 50%",
      ease: Elastic.easeOut
    });

    const floorTomtl = new TimelineMax({ paused: true });
    floorTomtl.to(floorTomDrumRef.current, 0.1, {
      scaleX: 1.02,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }).to(floorTomDrumRef.current, 0.1, {
      scaleY: 0.95,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut
    }, '0').to(floorTomDrumRef.current, 0.4, {
      scale: 1,
      transformOrigin: "50% 100%",
      ease: Elastic.easeOut
    });

    const snaretl = new TimelineMax({ paused: true });
    snaretl.to(snareDrumRef.current, 0.1, {
      scaleX: 1.04,
      transformOrigin: "50% 50%",
      ease: Expo.easeOut
    }).to(snareDrumRef.current, 0.1, {
      scaleY: 0.9,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut
    }, '0').to(snareDrumRef.current, 0.4, {
      scale: 1,
      transformOrigin: "50% 100%",
      ease: Elastic.easeOut
    });

    const kicktl = new TimelineMax({ paused: true });
    kicktl.to(kickDrumRef.current, 0.1, {
      scale: 1.02,
      transformOrigin: "50% 100%",
      ease: Expo.easeOut
    }).to(kickDrumRef.current, 0.4, {
      scale: 1,
      transformOrigin: "50% 100%",
      ease: Elastic.easeOut
    });

    const hiHattl = new TimelineMax({ paused: true });
    hiHattl.to(hiHatRef.current, 0.1, {
      rotation: -4,
      transformOrigin: "50% 50%"
    }).to(hiHatRef.current, 0.6, {
      rotation: 0,
      transformOrigin: "50% 50%",
      ease: Elastic.easeOut.config(1.5, 0.2)
    });

    const playAudio = (audioRef) => {
      const audioEl = audioRef.current;
      audioEl.currentTime = 0;
      audioEl.play();
    };

    const crash = () => {
      crashtl.restart();
      crashtl.play();
      playAudio(crashAudioRef);
    };

    const rightTom = () => {
      rightTomtl.restart();
      rightTomtl.play();
      playAudio(smallTomAudioRef);
    };

    const leftTom = () => {
      leftTomtl.restart();
      leftTomtl.play();
      playAudio(bigTomAudioRef);
    };

    const floorTom = () => {
      floorTomtl.restart();
      floorTomtl.play();
      playAudio(floorTomAudioRef);
    };

    const snare = () => {
      snaretl.restart();
      snaretl.play();
      playAudio(snareAudioRef);
    };

    const kick = () => {
      kicktl.restart();
      kicktl.play();
      playAudio(kickAudioRef);
    };

    const hiHat = () => {
      hiHattl.restart();
      hiHattl.play();
      playAudio(hiHatClosedAudioRef);
    };

    const sequencer = () => {
      // Logic for sequencer
    };

    const setTempo = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sequencer, 60000 / bpm);
    };

    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 74:
          hiHat();
          break;
        case 72:
          snare();
          break;
        case 66:
          kick();
          break;
        case 71:
          floorTom();
          break;
        case 70:
          crash();
          break;
        case 84:
          leftTom();
          break;
        case 89:
          rightTom();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalRef.current);
    };
  }, [bpm]);

  const toggleSequencer = () => {
    setSequencerVisible(!sequencerVisible);
  };

  const toggleSequencerOn = () => {
    setSequencerOn(!sequencerOn);
    if (!sequencerOn) {
      intervalRef.current = setInterval(sequencer, 60000 / bpm);
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const increaseBpm = () => {
    if (bpm < 300) {
      setBpm(bpm + 10);
      if (sequencerOn) {
        setTempo();
      }
    }
  };

  const decreaseBpm = () => {
    if (bpm > 100) {
      setBpm(bpm - 10);
      if (sequencerOn) {
        setTempo();
      }
    }
  };

  return (
    <div className="container">
      <header className="codrops-header">
        <div className="codrops-links">
          <a className="codrops-icon codrops-icon--prev" href="http://tympanus.net/Tutorials/SpringLoaders/" title="Previous Demo"><span>Previous Demo</span></a>
          <a className="codrops-icon codrops-icon--drop" href="http://tympanus.net/codrops/?p=26165" title="Back to the article"><span>Back to the Codrops article</span></a>
        </div>
        <h1>SVG Drums <span>with <a href="http://greensock.com/">GSAP</a> by <a href="https://twitter.com/iamjoshellis">Josh Ellis</a></span></h1>
      </header>
      <div className="content">
        <div id="container-sequencer" className={`container-sequencer ${sequencerVisible ? '' : 'collapse'}`}>
          <div id="sequencer" className="sequencer">
            {['crash', 'hiHat', 'snare', 'rightTom', 'leftTom', 'floorTom', 'kick'].map(drum => (
              <div className="row" data-target-drum={drum} key={drum}>
                <img src={`img/${drum}.png`} alt={drum.charAt(0).toUpperCase() + drum.slice(1)} />
                {Array(8).fill().map((_, i) => (
                  <label key={i}><input type="checkbox" /><span></span></label>
                ))}
              </div>
            ))}
            <div className="sequencer-controls">
              <button id="sequencer-active-btn" className="btn" aria-label="Play" onClick={toggleSequencerOn}><i className={`fa ${sequencerOn ? 'fa-pause' : 'fa-play'}`}></i></button>
              <input className="sequencer-controls-tempo" />
              <button id="bpm-decrease-btn" className="btn" aria-label="Decrease bpm" onClick={decreaseBpm}><i className="fa fa-minus"></i></button>
              <input id="bpm-indicator" type="number" min="100" max="300" size="3" value={bpm} readOnly />
              <button id="bpm-increase-btn" className="btn" aria-label="Increase bpm" onClick={increaseBpm}><i className="fa fa-plus"></i></button>
            </div>
          </div>
        </div>
        <div id="container-drums" className={`container-drums ${sequencerVisible ? 'screen-sm-hidden' : ''}`}>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 790" preserveAspectRatio="xMidYMid meet">
            {/* SVG content goes here */}
          </svg>
        </div>
      </div>
      <footer className="demo-footer">
        <div className="container-btns">
          <button className="btn btn-tooltip btn-sequencer" id="sequencer-visible-btn" aria-label="Toggle sequencer" onClick={toggleSequencer}><i className="fa fa-th"></i></button>
          <button className="btn btn-tooltip btn-keys" id="keys-btn" aria-label="Toggle keyboard legend"><i className="fa fa-keyboard-o"></i></button>
        </div>
      </footer>
      <audio id="Crash-Audio" ref={crashAudioRef} preload="auto">
        <source src="mp3/Crash.mp3" type="audio/mp3" />
      </audio>
      <audio id="Small-Rack-Tom-Audio" ref={smallTomAudioRef} preload="auto">
        <source src="mp3/Small-Rack-Tom.mp3" type="audio/mp3" />
      </audio>
      <audio id="Big-Rack-Tom-Audio" ref={bigTomAudioRef} preload="auto">
        <source src="mp3/Big-Rack-Tom.mp3" type="audio/mp3" />
      </audio>
      <audio id="Floor-Tom-Audio" ref={floorTomAudioRef} preload="auto">
        <source src="mp3/Floor-Tom.mp3" type="audio/mp3" />
      </audio>
      <audio id="Snare-Audio" ref={snareAudioRef} preload="auto">
        <source src="mp3/Snare.mp3" type="audio/mp3" />
      </audio>
      <audio id="Kick-Audio" ref={kickAudioRef} preload="auto">
        <source src="mp3/Kick.mp3" type="audio/mp3" />
      </audio>
      <audio id="Hi-Hat-Closed-Audio" ref={hiHatClosedAudioRef} preload="auto">
        <source src="mp3/Hi-Hat-Closed.mp3" type="audio/mp3" />
      </audio>
    </div>
  );
};

export default SVGDrumKit;