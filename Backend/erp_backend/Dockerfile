# 1. Use an official Python runtime as a parent image
FROM python:3.10-slim

# 2. Set environment variables to optimize Python inside the container
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Install system dependencies required for MySQL and handling packages
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 5. Copy the requirements file and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of your Django application code into the container
COPY . /app/

# 7. Expose the port Django will run on
EXPOSE 8000

# 8. Command to run the application using a production-ready WSGI server (Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "erp_backend.wsgi:application"]