FROM python:3.11-slim
WORKDIR /app
RUN addgroup --system --gid 1001 pygroup && adduser --system --uid 1001 pyuser --ingroup pygroup
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
RUN chown -R pyuser:pygroup /app
USER pyuser
CMD ["python", "main.py"]