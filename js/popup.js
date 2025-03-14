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
  let audioPlayer = null;
  let timerInterval;
  let totalDuration = 0;
  let remainingTime = 0;
  let isPaused = false;
  let currentTrack = trackSelector.value;
  let audioInitialized = false; // Flag to prevent recursive initialization

  // Track mapping
  const tracks = {
    track1: "/assets/tracks/interstellar.mp3",
    track2: "/assets/tracks/study-session.mp3",
    track3: "/assets/tracks/relaxing-vibes.mp3",
    track4: "/assets/tracks/focus-flow.mp3",
  };

  // Create a new Audio player safely
  function createNewAudioPlayer() {
    // Prevent recursion
    if (audioInitialized) {
      return;
    }

    audioInitialized = true;

    // Dispose of existing player if it exists
    if (audioPlayer) {
      try {
        audioPlayer.pause();
        audioPlayer.src = "";
        // Remove any previous event listeners
        audioPlayer.onended = null;
        audioPlayer.onerror = null;
        audioPlayer = null;
      } catch (e) {
        console.log("Error disposing audio player:", e);
      }
    }

    // Create a fresh player
    try {
      audioPlayer = new Audio();

      // Add error handler that doesn't cause recursion
      audioPlayer.onerror = function (e) {
        console.error("Audio error occurred:", e);
        // Don't recreate the player here, just log the error
      };
    } catch (e) {
      console.error("Failed to create audio player:", e);
    }

    audioInitialized = false;
  }

  // Initial audio player creation
  createNewAudioPlayer();

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

  // Reset audio system without recursion
  function resetAudioSystem() {
    // Store track to preserve across reset
    currentTrack = trackSelector.value;

    // Clean up player safely
    createNewAudioPlayer();

    // Reset state flags
    isPaused = false;

    // Reset button text
    pauseBtn.querySelector(".btn-content").textContent = "Pause";
  }

  // Update UI button states
  function updateButtonStates(isPlaying) {
    if (isPlaying) {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else {
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
      pauseBtn.querySelector(".btn-content").textContent = "Pause";
    }

    // Force UI update
    playBtn.classList.remove("play-btn");
    setTimeout(() => {
      playBtn.classList.add("play-btn");
    }, 0);
  }

  // Load track safely
  function loadTrack(trackId) {
    if (!audioPlayer) {
      createNewAudioPlayer();
    }

    try {
      const trackUrl = chrome.runtime.getURL(tracks[trackId]);
      audioPlayer.src = trackUrl;

      // Use simple load instead of adding event listeners
      audioPlayer.load();
      console.log("Track loaded:", trackId);
      return true;
    } catch (error) {
      console.error("Error loading track:", error);
      return false;
    }
  }

  // Play selected track with timer
  function startPlayback() {
    // Get track and duration
    const selectedTrack = trackSelector.value;
    totalDuration = calculateDuration();
    remainingTime = totalDuration;

    if (totalDuration <= 0) {
      alert("Please set a timer duration");
      return;
    }

    console.log("Starting playback of track:", selectedTrack);

    // Reset UI state
    isPaused = false;
    pauseBtn.querySelector(".btn-content").textContent = "Pause";

    // Ensure we have a clean player
    resetAudioSystem();

    // Load the selected track
    if (!loadTrack(selectedTrack)) {
      alert("Failed to load the selected track. Please try again.");
      updateButtonStates(false);
      return;
    }

    // Play after a short delay
    setTimeout(() => {
      try {
        const playPromise = audioPlayer.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            updateButtonStates(false);
          });
        }

        updateTimerDisplay();
        startTimer();
        updateButtonStates(true);
      } catch (error) {
        console.error("Play error:", error);
        updateButtonStates(false);
      }
    }, 100);
  }

  // Pause playback
  function pausePlayback() {
    if (!audioPlayer) {
      return;
    }

    if (isPaused) {
      // Resume playback
      try {
        const playPromise = audioPlayer.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error resuming audio:", error);
            updateButtonStates(false);
          });
        }

        startTimer();
        pauseBtn.querySelector(".btn-content").textContent = "Pause";
      } catch (error) {
        console.error("Resume error:", error);
        updateButtonStates(false);
      }
    } else {
      // Pause playback
      try {
        audioPlayer.pause();
        clearInterval(timerInterval);
        pauseBtn.querySelector(".btn-content").textContent = "Resume";
      } catch (error) {
        console.error("Pause error:", error);
      }
    }

    isPaused = !isPaused;
  }

  // Stop playback
  function stopPlayback() {
    clearInterval(timerInterval);

    // Stop audio if it exists
    if (audioPlayer) {
      try {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      } catch (error) {
        console.error("Error stopping playback:", error);
      }
    }

    // Complete reset of audio system
    resetAudioSystem();

    // Reset timer display
    remainingTime = 0;
    updateTimerDisplay();

    // Update UI - make sure play button is enabled
    updateButtonStates(false);
    isPaused = false;

    // Triple-check that play button is enabled
    setTimeout(() => {
      playBtn.disabled = false;
      playBtn.style.opacity = "1";
      playBtn.style.cursor = "pointer";
    }, 100);

    console.log("Stopped playback. Current track is:", currentTrack);
  }

  // Handle track selection change
  function handleTrackChange() {
    // Update track variables
    const newTrack = trackSelector.value;
    console.log("Track changed from", currentTrack, "to", newTrack);
    currentTrack = newTrack;

    // Always reset the pause/resume button to "Pause" on track change
    pauseBtn.querySelector(".btn-content").textContent = "Pause";

    // If already playing, restart with the new track
    if (audioPlayer && !audioPlayer.paused && !isPaused) {
      const currentTime = remainingTime;
      stopPlayback();

      // Preserve the timer duration
      remainingTime = currentTime;

      // Restart with new track
      startPlayback();
    } else if (isPaused) {
      // If paused, reset the state and update the UI
      isPaused = false;
      pauseBtn.querySelector(".btn-content").textContent = "Pause";
      stopPlayback();
    } else {
      // Even if we're not playing, ensure the play button is enabled
      playBtn.disabled = false;
    }
  }

  // Event handlers for timer input changes
  function onTimerInputChange() {
    if (audioPlayer && !audioPlayer.paused) return; // Don't modify button state during playback

    // Make sure play button is enabled when timer values change
    playBtn.disabled = false;
  }

  // Event listeners
  playBtn.addEventListener("click", startPlayback);
  pauseBtn.addEventListener("click", pausePlayback);
  stopBtn.addEventListener("click", stopPlayback);
  trackSelector.addEventListener("change", handleTrackChange);

  // Add event listeners to timer inputs
  hoursInput.addEventListener("change", onTimerInputChange);
  minutesInput.addEventListener("change", onTimerInputChange);
  secondsInput.addEventListener("change", onTimerInputChange);
  hoursInput.addEventListener("input", onTimerInputChange);
  minutesInput.addEventListener("input", onTimerInputChange);
  secondsInput.addEventListener("input", onTimerInputChange);

  // Add card hover effect
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-2px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });
  });

  // Initialize timer display and ensure play button is enabled on startup
  updateTimerDisplay();
  playBtn.disabled = false;
});
