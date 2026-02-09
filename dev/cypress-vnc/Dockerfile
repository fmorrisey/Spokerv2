FROM cypress/included:14.2.1

# Pre-install VNC packages so they don't need to be installed on every container start
RUN rm -f /etc/apt/sources.list.d/google-chrome.list \
         /etc/apt/sources.list.d/microsoft-edge*.list 2>/dev/null || true && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      xvfb fluxbox x11vnc novnc websockify netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
