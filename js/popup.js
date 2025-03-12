document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const trackSelector = document.getElementById("track-selector");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const timeRemaining = document.getElementById("time-remaining");
  const progressBar = document.getElementById("progress");

  // Audio player
  let audioPlayer = new Audio();
  let timerInterval;
  let totalDuration = 0;
  let remainingTime = 0;
  let isPaused = false;

  // Track mapping
  const tracks = {
    track1: "/assets/tracks/chill-beats.mp3",
    track2: "/assets/tracks/study-session.mp3",
    track3: "/assets/tracks/relaxing-vibes.mp3",
    track4: "/assets/tracks/focus-flow.mp3",
  };

  // Format time as HH:MM:SS
  function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  }

  // Calculate total timer duration in seconds
  function calculateDuration() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Update timer display
  function updateTimerDisplay() {
    timeRemaining.textContent = formatTime(remainingTime);

    // Update progress bar
    if (totalDuration > 0) {
      const progressPercentage =
        ((totalDuration - remainingTime) / totalDuration) * 100;
      progressBar.style.width = `${progressPercentage}%`;
    } else {
      progressBar.style.width = "0%";
    }

    // When timer reaches zero
    if (remainingTime <= 0) {
      stopPlayback();
    }
  }

  // Start the timer
  function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      remainingTime--;
      updateTimerDisplay();
    }, 1000);
  }

  // Play selected track with timer
  function startPlayback() {
    const selectedTrack = trackSelector.value;
    totalDuration = calculateDuration();
    remainingTime = totalDuration;

    if (totalDuration <= 0) {
      alert("Please set a timer duration");
      return;
    }

    audioPlayer.src = chrome.runtime.getURL(tracks[selectedTrack]);
    audioPlayer.play();

    updateTimerDisplay();
    startTimer();

    // Update UI
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    isPaused = false;
  }

  // Pause playback
  function pausePlayback() {
    if (isPaused) {
      // Resume playback
      audioPlayer.play();
      startTimer();
      pauseBtn.textContent = "Pause";
    } else {
      // Pause playback
      audioPlayer.pause();
      clearInterval(timerInterval);
      pauseBtn.textContent = "Resume";
    }

    isPaused = !isPaused;
  }

  // Stop playback
  function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    clearInterval(timerInterval);

    // Reset timer display
    remainingTime = 0;
    updateTimerDisplay();

    // Update UI - make sure play button is enabled
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = "Pause";
    isPaused = false;

    // Force UI update - sometimes needed to ensure button state is respected
    setTimeout(() => {
      playBtn.disabled = false;
    }, 0);
  }

  // Event handlers for timer input changes - ensure play button stays enabled
  function onTimerInputChange() {
    if (!audioPlayer.paused) return; // Don't modify button state during playback

    // Make sure play button is enabled when timer values change
    playBtn.disabled = false;
  }

  // Event listeners
  playBtn.addEventListener("click", startPlayback);
  pauseBtn.addEventListener("click", pausePlayback);
  stopBtn.addEventListener("click", stopPlayback);

  // Add event listeners to timer inputs to fix the bug
  hoursInput.addEventListener("change", onTimerInputChange);
  minutesInput.addEventListener("change", onTimerInputChange);
  secondsInput.addEventListener("change", onTimerInputChange);
  hoursInput.addEventListener("input", onTimerInputChange);
  minutesInput.addEventListener("input", onTimerInputChange);
  secondsInput.addEventListener("input", onTimerInputChange);

  // Initialize timer display
  updateTimerDisplay();
});
