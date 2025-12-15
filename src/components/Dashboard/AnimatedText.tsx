import { Text } from '@react-three/drei';

interface AnimatedTextProps {
    text: string;
    position?: [number, number, number];
    fontSize?: number;
    color?: string;
}

export default function AnimatedText({ text, position = [0, 0, 0], fontSize = 0.4, color = "white" }: AnimatedTextProps) {
    return (
        <group position={position}>
            <Text
                fontSize={fontSize}
                color={color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={fontSize * 0.08}
                outlineColor="#000000"
            >
                {text}
                <meshStandardMaterial
                    attach="material"
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.1} // "Make it little bright"
                    toneMapped={false}
                />
            </Text>
        </group>
    );
}
