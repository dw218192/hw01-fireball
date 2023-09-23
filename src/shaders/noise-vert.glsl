// keep these uniforms to simplify the code in main.ts
in vec4 vs_Pos;
out vec4 fs_Pos;

void main() {
    fs_Pos = vs_Pos;
    gl_Position = vs_Pos;
}