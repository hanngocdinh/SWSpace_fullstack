#!/usr/bin/env python3
"""
Launch AI detection for all 3 floors simultaneously
Each floor runs in a separate process with optimized human-only detection
"""
import subprocess
import sys
import os
import time

def main():
    backend_url = os.environ.get('SWS_BACKEND', 'http://localhost:5000')
    
    # Configuration for each floor
    # You can adjust source (camera index or video path) for each floor
    floors = [
        {
            'floor': 'floor1',
            'source': '0',  # Webcam 0 or change to video path
            'namespace': 'ai',
            'seat_zones': 'seat_zones_floor1.json',
            'description': 'Floor 1 - Hot Desk'
        },
        {
            'floor': 'floor2',
            'source': '1',  # Webcam 1 or change to video path
            'namespace': 'ai',
            'seat_zones': 'seat_zones_floor2.json',
            'description': 'Floor 2 - Meeting Rooms & Private Offices'
        },
        {
            'floor': 'floor3',
            'source': '2',  # Webcam 2 or change to video path
            'namespace': 'ai',
            'seat_zones': 'seat_zones_floor3.json',
            'description': 'Floor 3 - Hot Desk'
        }
    ]
    
    processes = []
    
    print("="*60)
    print("Starting AI Human Detection for All Floors")
    print(f"Backend: {backend_url}")
    print("="*60)
    
    for config in floors:
        print(f"\n🚀 Launching {config['description']}...")
        print(f"   Floor: {config['floor']}")
        print(f"   Source: {config['source']}")
        print(f"   Seat Zones: {config['seat_zones']}")
        
        # Optimized parameters for HUMAN-ONLY detection
        cmd = [
            sys.executable,
            'sender.py',
            '--backend', backend_url,
            '--floor', config['floor'],
            '--namespace', config['namespace'],
            '--source', config['source'],
            '--model', 'yolov8n.pt',
            '--seat-zones', config['seat_zones'],
            '--conf', '0.55',           # Higher confidence = less false positives
            '--classes', '0',            # ONLY detect person class (0)
            '--min-area', '0.004',       # Filter small detections
            '--face-verify', '1',        # ENABLE human verification (face/pose/HOG)
            '--ar-thresh', '0.8'         # Aspect ratio threshold for human shape
        ]
        
        try:
            proc = subprocess.Popen(
                cmd,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            processes.append({
                'process': proc,
                'config': config
            })
            print(f"   ✅ Started (PID: {proc.pid})")
            time.sleep(1)  # Small delay between launches
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)
    print(f"✅ All {len(processes)} floor detection processes started!")
    print("Press Ctrl+C to stop all processes")
    print("="*60 + "\n")
    
    try:
        # Wait for all processes
        while True:
            time.sleep(1)
            # Check if any process died
            for p in processes:
                if p['process'].poll() is not None:
                    print(f"⚠️  Warning: {p['config']['description']} process terminated")
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping all floor detection processes...")
        for p in processes:
            try:
                p['process'].terminate()
                p['process'].wait(timeout=5)
                print(f"   ✅ Stopped {p['config']['description']}")
            except Exception as e:
                print(f"   ⚠️  Error stopping {p['config']['description']}: {e}")
                try:
                    p['process'].kill()
                except:
                    pass
        print("\n✅ All processes stopped\n")

if __name__ == '__main__':
    main()
