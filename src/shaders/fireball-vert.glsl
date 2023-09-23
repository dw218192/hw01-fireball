in vec4 vs_Pos;
in vec4 vs_Nor;

out vec4 fs_Pos;
flat out float fs_Pulse;

void main() {
    // low frequency, high amplitude noise
    float t1 = (sin(u_Time * u_MainNoiseFreq) + 1.0) * 0.5;
    float noise = (perlin(vs_Pos.xyz) + 1.0) * 0.5;
    fs_Pulse = pulse(0.5, 0.5, t1);

    float pulse1 = noise * fs_Pulse * 0.25;

    // high frequency, low amplitude noise
    float pulse2 = triangle_wave(
        perlin(vs_Pos.xyz * u_SubNoiseFreq + 0.25 * u_Time) * 0.4, 0.3
    ) + 0.1;
    
    vec4 pos = vs_Pos + vs_Nor * (pulse1 + pulse2);
    fs_Pos = u_Model * pos;

    gl_Position = u_Proj * u_View * u_Model * pos;
}