import Cocoa
import Vision

func click(x: CGFloat, y: CGFloat) {
    let point = CGPoint(x: x, y: y)
    let mouseDown = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left)
    let mouseUp = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left)
    mouseDown?.post(tap: .cghidEventTap)
    usleep(50000) // 50ms delay
    mouseUp?.post(tap: .cghidEventTap)
    
    // Move mouse slightly away so hover state resets
    let movePoint = CGPoint(x: x, y: y - 50)
    let mouseMove = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: movePoint, mouseButton: .left)
    mouseMove?.post(tap: .cghidEventTap)
}

func scanAndClick() {
    var displayCount: UInt32 = 0
    CGGetActiveDisplayList(0, nil, &displayCount)
    var displays = [CGDirectDisplayID](repeating: 0, count: Int(displayCount))
    CGGetActiveDisplayList(displayCount, &displays, &displayCount)
    
    for display in displays {
        guard let cgImage = CGDisplayCreateImage(display) else { continue }
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        
        let request = VNRecognizeTextRequest { request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
            
            for observation in observations {
                guard let topCandidate = observation.topCandidates(1).first else { continue }
                let text = topCandidate.string.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
                
                // We look for exactly these words on the buttons
                if text == "retry" || text == "continue" {
                    let boundingBox = observation.boundingBox
                    let bounds = CGDisplayBounds(display)
                    
                    // Vision framework uses bottom-left origin, CoreGraphics uses top-left origin
                    let x = bounds.origin.x + (boundingBox.midX * bounds.width)
                    let y = bounds.origin.y + ((1 - boundingBox.midY) * bounds.height)
                    
                    let timeString = { () -> String in
                        let formatter = DateFormatter()
                        formatter.timeStyle = .medium
                        return formatter.string(from: Date())
                    }()
                    
                    print("[\(timeString)] ⚡️ Found '\(topCandidate.string)'. Clicking...")
                    click(x: x, y: y)
                }
            }
        }
        
        request.recognitionLevel = .accurate
        try? requestHandler.perform([request])
    }
}

print("🤖 Antigravity Native Auto-Resumer")
print("==================================")
print("Using macOS native Apple Neural Engine (Vision OCR)...")
print("No screenshots or Python packages required.")
print("Monitoring screen every 3 seconds... Press Ctrl+C to stop.\n")

while true {
    scanAndClick()
    sleep(3)
}
