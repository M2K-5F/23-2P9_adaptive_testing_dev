FROM python:3.8.10
WORKDIR /app
COPY setup.py .
RUN pip install -e .
COPY . .
EXPOSE 8001
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
