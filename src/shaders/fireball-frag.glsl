in vec4 fs_Pos;
flat in float fs_Pulse;
out vec4 out_Color;

void main() {
    float orangeness = mix(0.36, 0.26, bias(0.05, fs_Pulse));
    vec3 col = cos(perlin(fs_Pos.xyz + 0.25 * u_Time) + vec3(2.0, 5.0, 9.0) * orangeness);
    out_Color = vec4(col, 1.0);
}