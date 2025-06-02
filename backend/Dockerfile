# Use a clean Python base image
FROM python:3.12-slim

# Set workdir inside the container
WORKDIR /app

# Copy BE code into the container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

    
RUN mkdir -p /app/uploaded_images

# Expose the port FastAPI runs on
EXPOSE 8000

# Run the app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
