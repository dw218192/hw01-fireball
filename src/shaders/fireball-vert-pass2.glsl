in vec4 vs_Pos;
in vec2 vs_UV;

out vec4 fs_Pos;
out vec2 fs_UV;

void main() {
    gl_Position = vs_Pos;
    
    fs_Pos = vs_Pos;
    fs_UV = vs_UV;
}